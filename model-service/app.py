import os, sys, base64, io, pathlib, torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
YOLOV5_DIR = os.path.join(BASE_DIR, 'yolov5')
sys.path.insert(0, YOLOV5_DIR)
pathlib.PosixPath = pathlib.WindowsPath

app = Flask(__name__)
CORS(app)

WEIGHTS  = os.path.join(BASE_DIR, 'best.pt')
CLASSES  = ['Bacterial_Blight', 'Rice_Blast', 'Brown_Spot']
CONF_THR = 0.25

DISEASE_INFO = {
    'Bacterial_Blight': {
        'description': 'Bacterial Blight is caused by Xanthomonas oryzae pv. oryzae. It causes yellowing and wilting of leaves, leading to significant yield loss.',
        'severity': 'High',
        'treatment': [
            'Apply copper-based bactericides immediately.',
            'Remove and destroy infected plant parts.',
            'Avoid overhead irrigation to reduce leaf wetness.',
            'Use resistant rice varieties in future seasons.',
            'Ensure proper field drainage to reduce humidity.',
        ]
    },
    'Rice_Blast': {
        'description': 'Rice Blast is caused by the fungus Magnaporthe oryzae. It produces diamond-shaped lesions with grey centers on leaves and can infect all parts of the plant.',
        'severity': 'Very High',
        'treatment': [
            'Apply systemic fungicides such as Tricyclazole or Isoprothiolane.',
            'Avoid excessive nitrogen fertilization.',
            'Maintain proper spacing between plants for airflow.',
            'Remove infected debris and avoid crop residue buildup.',
            'Use certified blast-resistant rice varieties.',
        ]
    },
    'Brown_Spot': {
        'description': 'Brown Spot is caused by Helminthosporium oryzae. It appears as brown oval lesions on leaves and is often associated with nutrient-deficient soils.',
        'severity': 'Moderate',
        'treatment': [
            'Apply Mancozeb or Iprodione fungicide to affected areas.',
            'Improve soil fertility with balanced NPK fertilizers.',
            'Use disease-free certified seeds for the next planting.',
            'Avoid water stress during critical growth stages.',
            'Treat seeds with fungicides before sowing.',
        ]
    },
    'Healthy': {
        'description': 'No disease detected. The rice plant appears healthy with no visible signs of infection.',
        'severity': 'None',
        'treatment': [
            'Continue regular watering and balanced fertilization.',
            'Monitor plants weekly for any early signs of stress.',
            'Maintain good airflow between plants to prevent humidity buildup.',
            'Rotate crops annually to reduce soil-borne disease risk.',
            'Keep field clean and free from weeds.',
        ]
    }
}

print('Loading YOLO model from bundled source...')
model = torch.hub.load(YOLOV5_DIR, 'custom', path=WEIGHTS, source='local', force_reload=False, verbose=False)
model.conf = CONF_THR
model.eval()
print(f'Model loaded! Classes: {model.names}')

def decode_b64(b64):
    if ',' in b64: b64 = b64.split(',')[1]
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGB')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'classes': CLASSES})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if request.is_json:
            data = request.get_json()
            if not data or 'image' not in data:
                return jsonify({'error': "Missing 'image' field"}), 400
            img = decode_b64(data['image'])
        elif 'image' in request.files:
            img = Image.open(io.BytesIO(request.files['image'].read())).convert('RGB')
        else:
            return jsonify({'error': 'No image provided'}), 400

        results = model(img, size=640)
        df = results.pandas().xyxy[0]

        if df.empty:
            label = 'Healthy'; is_healthy = True; confidence = 98
        else:
            best = df.loc[df['confidence'].idxmax()]
            label = str(best['name']); confidence = round(float(best['confidence']) * 100); is_healthy = False

        info = DISEASE_INFO.get(label, DISEASE_INFO['Healthy'])
        return jsonify({
            'label': label, 'displayName': label.replace('_', ' '),
            'isHealthy': is_healthy, 'confidence': confidence,
            'severity': info['severity'], 'description': info['description'],
            'treatment': info['treatment'], 'allClasses': CLASSES,
        })
    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('MODEL_PORT', 8000))
    print(f'Model service on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=False)
