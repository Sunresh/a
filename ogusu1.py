import tensorflow as tf

# Test TensorFlow and Keras
print(f"TensorFlow version: {tf.__version__}")

# Build a simple model to test Keras
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense

model = Sequential([Dense(10, input_shape=(4,))])
print("Model created successfully.")
