import torch
import torch.nn as nn
import torch.nn.functional as F
from config import *

class Conv(nn.Module):
    def __init__(self, in_c, out_c, k=3, s=1):
        super().__init__()
        p = k // 2
        self.conv = nn.Sequential(
            nn.Conv2d(in_c, out_c, k, s, p, bias=False),
            nn.BatchNorm2d(out_c), #normalizes features
            nn.LeakyReLU(0.1)
        )

    def forward(self, x):
        return self.conv(x)

class Ghost(nn.Module):
    def __init__(self, in_c, out_c, ratio=2):
        super().__init__()
        init_c = out_c // ratio
        cheap_c = out_c - init_c

        self.primary = Conv(in_c, init_c, 1, 1)
        self.cheap = nn.Sequential(
            nn.Conv2d(init_c, cheap_c, 3, 1, 1, groups=init_c, bias=False),
            nn.BatchNorm2d(cheap_c),
            nn.LeakyReLU(0.1)
        )

    def forward(self, x):
        x1 = self.primary(x)
        x2 = self.cheap(x1)
        return torch.cat([x1, x2], dim=1)

class Ghost_B(nn.Module):
    def __init__(self, in_c, hidden_c, out_c, stride=1):
        super().__init__()

        self.ghost1 = Ghost(in_c, hidden_c)

        if stride > 1:
            self.dw = nn.Conv2d(hidden_c, hidden_c, 3, stride, 1,
                                groups=hidden_c, bias=False)
        else:
            self.dw = nn.Identity() #take input as output

        self.ghost2 = Ghost(hidden_c, out_c)

        if stride == 1 and in_c == out_c:
            self.sc = nn.Identity()
        else:
            self.sc = nn.Sequential(
                nn.Conv2d(in_c, out_c, 1, stride, 0, bias=False),
                nn.BatchNorm2d(out_c)
            )

    def forward(self, x):
        res = x
        x = self.ghost1(x)
        x = self.dw(x)
        x = self.ghost2(x)
        return x + self.sc(res)

class CAM(nn.Module):
    def __init__(self, channels, reduction=16):
        super(CAM, self).__init__()

        mid = max(1, channels // reduction)

        self.mlp = nn.Sequential(
            nn.Linear(channels, mid, bias=False),
            nn.ReLU(),
            nn.Linear(mid, channels, bias=False)
        )

    def forward(self, x):
        B, C, H, W = x.size()
        avg_pool = F.adaptive_avg_pool2d(x, 1).view(B, C)
        max_pool = F.adaptive_max_pool2d(x, 1).view(B, C)

        avg_out = self.mlp(avg_pool)
        max_out = self.mlp(max_pool)

        out = avg_out + max_out
        out = torch.sigmoid(out).view(B, C, 1, 1)

        return x * out

class SAM(nn.Module):
    def __init__(self):
        super(SAM, self).__init__()

        self.conv = nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=False)

    def forward(self, x):
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out = torch.max(x, dim=1, keepdim=True)

        x_cat = torch.cat([avg_out, max_out], dim=1)
        att = torch.sigmoid(self.conv(x_cat))

        return x * att

class CBAM(nn.Module):
    def __init__(self, channels, reduction=16):
        super(CBAM, self).__init__()

        self.cam = CAM(channels, reduction)
        self.sam = SAM()

    def forward(self, x):
        x = self.cam(x)
        x = self.sam(x)
        return x

class SPP(nn.Module):
    def __init__(self):
        super().__init__()
        self.p1 = nn.MaxPool2d(kernel_size=5, stride=1, padding=2)
        self.p2 = nn.MaxPool2d(9, 1, 4)
        self.p3 = nn.MaxPool2d(13, 1, 6)

    def forward(self, x):
        return torch.cat([x, self.p1(x), self.p2(x), self.p3(x)], dim=1)

class CBR(nn.Module):
    def __init__(self, in_c, out_c, k=3, s=1):
        super().__init__()
        p = k // 2
        self.block = nn.Sequential(
            nn.Conv2d(in_c, out_c, k, s, p, bias=False),
            nn.BatchNorm2d(out_c),
            nn.ReLU(0.1) 
        )

    def forward(self, x):
        return self.block(x)

class SCO(nn.Module):
    def __init__(self, channels):
        super().__init__()

        c = channels // 2

        self.conv1 = CBR(c, c, 3, 1)
        self.conv2 = CBR(c, c, 3, 1)

        self.upsample = nn.Upsample(scale_factor=2, mode='nearest')

    def forward(self, x):
        c = x.shape[1] // 2

        x1 = x[:, :c, :, :]
        x2 = x[:, c:, :, :]

        o1 = self.conv1(x1)
        o2 = self.conv2(x2)

        o2 = self.upsample(o2)
        out1 = o1 + o2
        out2 = o2 + o1
        return torch.cat([out1, out2], dim=1)

class SCFEM(nn.Module):
    def __init__(self, in_channels):
        super().__init__()

        mid = in_channels // 2

        self.cbr1 = CBR(in_channels, mid, k=1, s=1)
        self.sco = SCO(mid)
        self.cbr2 = CBR(mid, in_channels, k=1, s=1)

    def forward(self, x):
        x = self.cbr1(x)   
        x = self.sco(x)   
        x = self.cbr2(x)  
        return x

"""Dual-Dimensional Mixed Attention"""
class DDMA(nn.Module):

    def __init__(self, channels, reduction=16):
        super(DDMA, self).__init__()
        self.cam = CAM(channels, reduction)
        self.sam = SAM()

    def forward(self, x):
        out = torch.cat([self.cam, self.sam], dim=1)
        out = self.fusion(out)

        return out

"""Space-to-Depth Convolution (Helps detect small objects)"""
class SPDConv(nn.Module):
    def __init__(self, in_channels, out_channels, block_size=2):
        super().__init__()

        self.block_size = block_size

        self.conv = nn.Sequential(
            nn.Conv2d(in_channels * (block_size ** 2), out_channels, 3, 1, 1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(0.1)
        )

    def forward(self, x):
        B, C, H, W = x.size()
        bs = self.block_size

        # Space to Depth
        x = x.view(B, C, H//bs, bs, W//bs, bs)
        x = x.permute(0, 1, 3, 5, 2, 4).contiguous()
        x = x.view(B, C * (bs**2), H//bs, W//bs)

        x = self.conv(x)

        return x

"""Disease Enhancement Block (DEB) -- > texture and edge information, 
improving detection of fine-grained disease patterns such as 
spots and boundaries."""

class DEB(nn.Module):
    def __init__(self):
        super().__init__()
        #Sobel operator -> edge detection filter (boundaries / edges / sharp changes in image)
        sobel_x = torch.tensor([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=torch.float32)
        sobel_y = torch.tensor([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=torch.float32)

        self.register_buffer("sobel_x", sobel_x.view(1,1,3,3))
        self.register_buffer("sobel_y", sobel_y.view(1,1,3,3))

    def forward(self, x):
        B, C, H, W = x.shape

        #Texture Amplification Module (TAM) [texture patterns like spots, positions]
        blur = F.avg_pool2d(x, 3, 1, 1)
        texture = torch.abs(x - blur)
        x = x + texture

        #Edge Boosting Module (EBM) [Enhances disease boundaries]
        sobel_x = self.sobel_x.repeat(C,1,1,1)
        sobel_y = self.sobel_y.repeat(C,1,1,1)

        edge_x = F.conv2d(x, sobel_x, padding=1, groups=C)
        edge_y = F.conv2d(x, sobel_y, padding=1, groups=C)

        edges = torch.sqrt(edge_x**2 + edge_y**2)

        x = x + edges

        return x
    
class head(nn.Module):
    def __init__(self, in_channels, num_classes, num_boxes=3):
        super().__init__()

        self.num_boxes = num_boxes
        self.num_classes = num_classes

        self.cbl1 = Conv(in_channels, 256, 3, 1)
        self.cbl2 = Conv(256, 256, 3, 1)
        self.cbl3 = Conv(256, 128, 3, 1)

        self.pred = nn.Conv2d(
            128,
            num_boxes * (5 + num_classes),
            kernel_size=1
        )

    def forward(self, x):
        x = self.cbl1(x)
        x = self.cbl2(x)
        x = self.cbl3(x)

        x = self.pred(x)

        B, _, H, W = x.shape

        x = x.view(B, self.num_boxes, 5 + self.num_classes, H, W)
        x = x.permute(0, 3, 4, 1, 2)

        return x

class YOLO(nn.Module):

    def __init__(self):
        super().__init__()

        #Workflow
        self.layer1 = Conv(3, 16)                  

        self.layer2 = Ghost_B(16, 32, 32)          
        self.scfem1 = SCFEM(32)
        self.pool1 = nn.MaxPool2d(2, 2)

        self.layer3 = Ghost_B(32, 64, 64)
        self.scfem2 = SCFEM(64)
        self.pool2 = nn.MaxPool2d(2, 2)

        self.layer4 = Ghost_B(64, 128, 128)
        self.scfem3 = SCFEM(128)
        self.pool3 = nn.MaxPool2d(2, 2)

        self.cbam = CBAM(128)
        self.spp = SPP()

        self.reduce = Conv(128 * 4, 128, 1, 1)

        self.scfem = SCFEM(128)

        #new modules
        self.ddma = DDMA(128)
        self.spd = SPDConv(64, 128)
        self.deb = DEB()
        
        self.head = head(128, NUM_CLASSES)

    def forward(self, x):

        x = self.layer1(x)

        x = self.layer2(x)
        x = self.scfem1(x)
        x = self.pool1(x)

        x = self.layer3(x)
        x = self.scfem2(x)
        x = self.pool2(x)

        x = self.layer4(x)
        x = self.scfem3(x)
        x = self.pool3(x)

        x = self.cbam(x)
        x = self.spp(x)

        x = self.reduce(x)
        x = self.scfem(x)

        x = self.ddma(x)
        x = self.spd(x)
        x = self.deb(x)

        x = self.head(x)
        return x

if __name__ == "__main__":
    model = YOLO()
    x = torch.randn(1, 3, 640, 640)

    out = model(x)
    print("Output shape:", out.shape)