import os
import torch
import cv2
import numpy as np

from models.yolo_model import YOLO
from config import *

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = YOLO(num_classes=NUM_CLASSES).to(device)
model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device))
model.eval()

def preprocess(img_path):
    img = cv2.imread(img_path)

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    img = np.transpose(img, (2, 0, 1))

    img = torch.tensor(img, dtype=torch.float32).unsqueeze(0)

    return img.to(device)

def get_best_prediction(preds):
    preds = preds[0]

    best_conf = 0
    best_class = None

    S = preds.shape[0]

    for i in range(S):
        for j in range(S):
            for b in range(3):
                pred = preds[i, j, b]

                conf = torch.sigmoid(pred[4]).item()

                if conf > best_conf:
                    class_scores = torch.sigmoid(pred[5:])
                    cls = torch.argmax(class_scores).item()

                    best_conf = conf
                    best_class = cls

    return best_class, best_conf


def run():
    for img_name in os.listdir(INPUT_FOLDER):
        img_path = os.path.join(INPUT_FOLDER, img_name)

        img = preprocess(img_path)

        with torch.no_grad():
            preds = model(img)

        cls, conf = get_best_prediction(preds)

        if cls is not None and conf > CONF_THRESHOLD:
            print(f"{img_name} -> Disease: {CLASS_NAMES[cls]} (Accuracy level: {conf:.2f})")
        else:
            print(f"{img_name} -> No disease detected")

if __name__ == "__main__":
    run()