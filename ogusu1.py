import tensorflow as tf

# Check TensorFlow version
print(f"TensorFlow version: {tf.__version__}")

# Use tf.keras instead of importing keras separately
keras = tf.keras

# Import layers and Sequential from tf.keras
layers = tf.keras.layers
Sequential = tf.keras.Sequential

# Import ImageDataGenerator
try:
    ImageDataGenerator = tf.keras.preprocessing.image.ImageDataGenerator
except AttributeError:
    # For TensorFlow 2.4+
    from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Now you can use these imports in your code
train_datagen = ImageDataGenerator(rescale=1./255)
test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    'C:/Users/kouki-15/Pictures/Screenshots',
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary'
)

validation_generator = test_datagen.flow_from_directory(
    'C:/Users/kouki-15/Pictures/Screenshots',
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary'
)

model = Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Rest of your code remains the same
train_datagen = ImageDataGenerator(rescale=1./255)
test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    'C:/Users/kouki-15/Pictures/Screenshots',
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary'
)

validation_generator = test_datagen.flow_from_directory(
    'C:/Users/kouki-15/Pictures/Screenshots',
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary'
)

model = Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

history = model.fit(
    train_generator,
    steps_per_epoch=len(train_generator),
    epochs=10,
    validation_data=validation_generator,
    validation_steps=len(validation_generator)
)

loss, accuracy = model.evaluate(validation_generator)
print('Validation Accuracy:', accuracy)

from PIL import Image
import numpy as np

new_image = Image.open('C:/Users/kouki-15/Pictures/Screenshots/Screenshot 2024-10-10 151351.png').resize((150, 150))
new_image_array = np.array(new_image) / 255.0
new_image_array = np.expand_dims(new_image_array, axis=0)

prediction = model.predict(new_image_array)
print('Prediction:', prediction)