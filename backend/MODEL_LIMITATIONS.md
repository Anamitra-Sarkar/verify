# AI Model Limitations and Known Issues

## Overview
This document outlines the limitations of the current AI models used in the VeriFy backend and recommendations for production improvements.

## Text/Fake News Detection

### Current Model
- **Model**: `hamzab/roberta-fake-news-classification`
- **Type**: RoBERTa fine-tuned on fake news datasets

### Limitations
1. **Style vs Content**: The model can be influenced by writing style. Formally written fake news may be classified as "real" if it follows news article patterns.

2. **Training Data Bias**: The model is trained on specific news article datasets and may not generalize well to:
   - Short factual statements
   - Scientific facts out of news context
   - Social media posts
   - Non-English content (though we have Tavily for translation)

3. **Confidence Issues**: Some predictions show high confidence even when incorrect, suggesting the model may be overconfident in certain domains.

### Accuracy Observed
- **Conspiracy theories**: ~60-80% accuracy (some with formal phrasing misclassified as real)
- **News-like articles**: ~85-90% accuracy
- **Short facts**: ~50-70% accuracy (not ideal use case)

### Recommendations for Production

#### Short-term Improvements
1. Add confidence thresholds (implemented: < 65% → unverified)
2. Combine with Tavily fact-checking for verification
3. Add keyword-based heuristics for well-known conspiracy theories
4. Implement fact-check database for common claims

#### Long-term Improvements
1. **Better Models**:
   - `bert-base-uncased-finetuned-fakenews` (better generalization)
   - `roberta-large-openai-detector` (detects AI-generated text)
   - Custom fine-tuning on diverse datasets

2. **Multi-model Ensemble**:
   - Combine multiple models and use voting
   - Use different models for different content types

3. **Domain-specific Models**:
   - Political fact-checking model
   - Health misinformation model  
   - Science claim verification model

4. **Knowledge Base Integration**:
   - Connect to fact-check databases (Snopes, FactCheck.org)
   - Use knowledge graphs for claim verification
   - Implement RAG (Retrieval-Augmented Generation) with GPT-4

## Image Detection

### Current Model
- **Model**: `microsoft/resnet-50`
- **Type**: ImageNet classification (NOT a deepfake detector)

### Limitations
1. **Not Specialized**: ResNet-50 is a general image classifier, not trained for deepfake detection
2. **Heuristic Approach**: We use ImageNet class predictions as heuristics, which is imprecise
3. **False Positives**: Can flag normal images with certain characteristics

### Recommendations
1. Use specialized deepfake detectors:
   - `dima806/deepfake_vs_real_image_detection`
   - Models trained on FaceForensics++ dataset
   - Capsule Networks for deepfake detection

2. Implement multi-stage pipeline:
   - Face detection (MTCNN)
   - Face alignment
   - Deepfake detection on faces
   - Artifact detection (compression, blending)

## Video Detection

### Current Implementation
- Frame-by-frame analysis using image classifier
- Samples 8 frames evenly distributed
- Uses majority voting

### Limitations
1. **No Temporal Analysis**: Doesn't consider motion or temporal inconsistencies
2. **Limited Sampling**: 8 frames may miss manipulated sections
3. **Performance**: Slow for long videos

### Recommendations
1. Use temporal models:
   - 3D CNNs (C3D, I3D)
   - LSTM-based detectors
   - `selimsef/dfdc_deepfake_challenge` (DeepFake Detection Challenge winner)

2. Improve sampling:
   - Scene detection for better frame selection
   - Focus on faces and key moments
   - Adaptive sampling based on video length

3. Audio-visual consistency checks:
   - Lip-sync analysis
   - Audio-visual correlation

## Voice/Audio Detection

### Current Model
- **Model**: `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition`
- **Type**: Emotion recognition (NOT a deepfake detector)

### Limitations
1. **Wrong Domain**: Emotion recognition ≠ deepfake detection
2. **Heuristic Only**: We infer from emotion patterns, which is unreliable
3. **No Artifact Detection**: Doesn't analyze audio artifacts specific to synthesis

### Recommendations
1. Use specialized voice anti-spoofing models:
   - ASVspoof2021 winning models
   - AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal graph attention)
   - RawNet2/RawNet3

2. Multi-feature analysis:
   - Mel-frequency cepstral coefficients (MFCC)
   - Linear frequency cepstral coefficients (LFCC)
   - Constant Q Transform (CQT)

3. Commercial APIs:
   - Pindrop (voice authentication)
   - Resemble AI (deepfake detection)

## General Recommendations

### 1. Model Selection Criteria
- ✅ Trained specifically for the task (not repurposed)
- ✅ Recent training data (models updated regularly)
- ✅ Published accuracy metrics on standard benchmarks
- ✅ Active maintenance and community support

### 2. Production Architecture
```
User Input
    ↓
┌─────────────────────┐
│  Content Router     │ ← Determines content type
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Specialized Models  │ ← Use best model for each type
│  - Text: BERT/GPT   │
│  - Image: FF++ CNN  │
│  - Video: 3D-CNN    │
│  - Audio: ASVspoof  │
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Fact-Check APIs     │ ← Cross-reference with databases
│  - Tavily           │
│  - Snopes API       │
│  - Google Fact Check│
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Ensemble Voting     │ ← Combine multiple signals
└─────────────────────┘
    ↓
Final Verdict (with confidence)
```

### 3. Monitoring and Improvement
- Track prediction accuracy by content type
- Collect user feedback on predictions
- A/B test new models
- Regular retraining with new data
- Monitor for model drift

### 4. Transparency
- Always show which models made the prediction
- Display confidence scores
- Provide explanations (SHAP, LIME)
- Link to fact-check sources
- Allow users to report incorrect predictions

## Summary

The current implementation provides a **functional baseline** with real AI models, but has known limitations:

- ✅ **Working**: Models load correctly and make predictions
- ✅ **Optimized**: Efficient processing with proper cleanup
- ✅ **Production-ready code**: Error handling, validation, logging
- ⚠️ **Model Accuracy**: ~60-80% depending on content type
- ⚠️ **Generalization**: Limited to training data domains

For **production deployment** at scale:
1. Replace with specialized models (estimated cost: $5-10K for training/licensing)
2. Implement ensemble approaches (3-5 models per type)
3. Add human-in-the-loop for edge cases
4. Regular model updates and retraining

**Current Status**: Suitable for demo/prototype. Requires model upgrades for production.
