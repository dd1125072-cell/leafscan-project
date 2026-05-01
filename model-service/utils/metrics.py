import numpy as np

def iou(box1, box2): #area of overlap / area of union
    # box = [x1, y1, x2, y2]

    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter_area = max(0, x2 - x1) * max(0, y2 - y1) # intersection area

    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])

    union = area1 + area2 - inter_area + 1e-6

    return inter_area / union

def iou_loss(box1, box2):

    # centers
    b1_x = (box1[0] + box1[2]) / 2
    b1_y = (box1[1] + box1[3]) / 2
    b2_x = (box2[0] + box2[2]) / 2
    b2_y = (box2[1] + box2[3]) / 2

    center_dist = (b1_x - b2_x)**2 + (b1_y - b2_y)**2

    # enclosing box
    enclose_x1 = min(box1[0], box2[0])
    enclose_y1 = min(box1[1], box2[1])
    enclose_x2 = max(box1[2], box2[2])
    enclose_y2 = max(box1[3], box2[3])

    c = (enclose_x2 - enclose_x1)**2 + (enclose_y2 - enclose_y1)**2

    # normalized distance between box centers
    R = center_dist / c
    Iou = iou(box1, box2)

    return 1 - Iou + R

def diou(box1, box2): #iou - d2 / c2
    Iou = iou(box1, box2)
    # center points
    c1x = (box1[0] + box1[2]) / 2
    c1y = (box1[1] + box1[3]) / 2
    c2x = (box2[0] + box2[2]) / 2
    c2y = (box2[1] + box2[3]) / 2

    # distance between centers
    d = (c1x - c2x) ** 2 + (c1y - c2y) ** 2

    # minimizing box
    ex1 = min(box1[0], box2[0])
    ey1 = min(box1[1], box2[1])
    ex2 = max(box1[2], box2[2])
    ey2 = max(box1[3], box2[3])

    c = (ex2 - ex1) ** 2 + (ey2 - ey1) ** 2 + 1e-6

    return Iou - (d / c)

def diou_loss(box1, box2):
    Diou = diou(box1, box2)
    return 1 - Diou

def ciou(box1, box2):
    Iou = iou(box1, box2)

    # centers
    b1_x = (box1[0] + box1[2]) / 2
    b1_y = (box1[1] + box1[3]) / 2
    b2_x = (box2[0] + box2[2]) / 2
    b2_y = (box2[1] + box2[3]) / 2

    center_dist = (b1_x - b2_x)**2 + (b1_y - b2_y)**2

    # enclosing box
    enclose_x1 = min(box1[0], box2[0])
    enclose_y1 = min(box1[1], box2[1])
    enclose_x2 = max(box1[2], box2[2])
    enclose_y2 = max(box1[3], box2[3])

    c = (enclose_x2 - enclose_x1)**2 + (enclose_y2 - enclose_y1)**2 + 1e-6
    R = center_dist / c

    # aspect ratio
    w1 = box1[2] - box1[0]
    h1 = box1[3] - box1[1]
    w2 = box2[2] - box2[0]
    h2 = box2[3] - box2[1]

    v = (4 / (np.pi**2)) * (np.arctan(w2 / h2) - np.arctan(w1 / h1))**2
    alpha = v / (1 - Iou + v + 1e-6)

    ciou = iou - ((center_dist + R) / c + alpha * v)

    return ciou

def ciou_loss(box1, box2):
    return 1 - ciou(box1, box2)

def precision(tp, fp):
    return tp / (tp + fp + 1e-6)


def recall(tp, fn):
    return tp / (tp + fn + 1e-6)

def f1_score(p, r):
    return 2 * (p * r) / (p + r + 1e-6)

def ap(recal, prec):
    recal = np.concatenate(([0.0], recal, [1.0]))
    prec = np.concatenate(([0.0], prec, [0.0]))

    for i in range(len(prec) - 1, 0, -1):
        prec[i - 1] = max(prec[i - 1], prec[i])

    i = np.where(recal[1:] != recal[:-1])[0]
    ap = np.sum((recal[i + 1] - recal[i]) * prec[i + 1])

    return ap

def map(ap):

    if len(ap) == 0:
        return 0

    return sum(ap) / len(ap)

def metrics(tp, fp, fn):
    p = precision(tp, fp)
    r = recall(tp, fn)
    f1 = f1_score(p, r)
    avgprec = ap(r,p)

    return {
        "Precision": p,
        "Recall": r,
        "F1": f1,
        "Average precision" : avgprec
    }