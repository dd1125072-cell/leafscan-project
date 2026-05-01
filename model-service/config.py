NUM_CLASSES = 3
CLASS_NAMES = ["Bacterial Blight", "Rice Blast", "Brown Spot"]

IMG_SIZE = 640

BATCH_SIZE = 4
LEARNING_RATE = 1e-4
EPOCHS = 50
NUM_BOXES = 3

TRAIN_IMG_DIR = "data/images/train"
TRAIN_LABEL_DIR = "data/labels/train"

VAL_IMG_DIR = "data/images/val"
VAL_LABEL_DIR = "data/labels/val"

WEIGHTS_PATH = "best.pt"

CONF_THRESHOLD = 0.5
INPUT_FOLDER = "result/input"
OUTPUT_FOLDER = "result/output"