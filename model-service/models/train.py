import torch
import torch.nn as nn
import torch.optim as optim

from torch.utils.data import dataload
from models.yolo_model import YOLO
from utils.dataload import yolods, collate_fn
from config import *

class yololoss(nn.Module):
    def __init__(self, num_classes=3):
        super(yololoss, self).__init__()
        self.mse = nn.MSELoss()
        self.bce = nn.BCEWithLogitsLoss() #object confidence, class prediction
        self.num_classes = num_classes

    def forward(self, predictions, targets):
        loss = 0

        for t in targets:
            img_idx = int(t[0])
            cls = int(t[1])
            x, y, w, h = t[2:]

            S = predictions.shape[1]
            grid_x = int(x * S)
            grid_y = int(y * S)

            pred = predictions[img_idx, grid_y, grid_x, 0]

            loss += self.mse(pred[0:4], torch.tensor([x, y, w, h]))

            loss += self.bce(pred[4], torch.tensor(1.0))

            target_cls = torch.zeros(self.num_classes)
            target_cls[cls] = 1
            loss += self.bce(pred[5:], target_cls)

        return loss

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_dataset = yolods(
        image_dir=TRAIN_IMG_DIR,
        label_dir=TRAIN_LABEL_DIR,
        img_size=IMG_SIZE
    )

    train_loader = dataload(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        collate_fn=collate_fn
    )

    model = YOLO(num_classes=NUM_CLASSES).to(device)

    criterion = yololoss(num_classes=NUM_CLASSES)
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0

        for images, targets in train_loader:
            images = images.to(device)
            targets = targets.to(device)

            preds = model(images)

            loss = criterion(preds, targets)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        print(f"Epoch [{epoch+1}/{EPOCHS}] Loss: {total_loss:.4f}")

    torch.save(model.state_dict(), WEIGHTS_PATH)
    print("Model saved!")

if __name__ == "__main__":
    train()