import sys
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                              QHBoxLayout, QLabel, QLineEdit, QPushButton, 
                              QFileDialog, QListWidget)
from PySide6.QtGui import QClipboard
import os

class FileSearcherApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("File Searcher")
        self.setGeometry(100, 100, 600, 400)

        # Main widget and layout
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)

        # Directory selection
        self.dir_layout = QHBoxLayout()
        self.dir_label = QLabel("Directory:")
        self.dir_input = QLineEdit()
        self.dir_button = QPushButton("Browse")
        self.dir_button.clicked.connect(self.browse_directory)
        self.dir_layout.addWidget(self.dir_label)
        self.dir_layout.addWidget(self.dir_input)
        self.dir_layout.addWidget(self.dir_button)
        self.layout.addLayout(self.dir_layout)

        # Search input
        self.search_layout = QHBoxLayout()
        self.search_label = QLabel("Search term:")
        self.search_input = QLineEdit()
        self.search_button = QPushButton("Search")
        self.search_button.clicked.connect(self.search_files)
        self.search_layout.addWidget(self.search_label)
        self.search_layout.addWidget(self.search_input)
        self.search_layout.addWidget(self.search_button)
        self.layout.addLayout(self.search_layout)

        # Results display
        self.result_list = QListWidget()
        self.result_list.itemClicked.connect(self.copy_to_clipboard)
        self.layout.addWidget(self.result_list)

    def browse_directory(self):
        directory = QFileDialog.getExistingDirectory(self, "Select Directory")
        if directory:
            self.dir_input.setText(directory)

    def search_files(self):
        self.result_list.clear()
        directory = self.dir_input.text()
        search_term = self.search_input.text().lower()

        if not directory:
            self.result_list.addItem("Please select a directory")
            return

        if not search_term:
            self.result_list.addItem("Please enter a search term")
            return

        try:
            for root, _, files in os.walk(directory):
                for file in files:
                    if search_term in file.lower():
                        full_path = os.path.join(root, file)
                        self.result_list.addItem(full_path)
            
            if self.result_list.count() == 0:
                self.result_list.addItem("No files found matching the search term")
                
        except Exception as e:
            self.result_list.addItem(f"Error: {str(e)}")

    def copy_to_clipboard(self, item):
        """Copy the clicked item's text (full path) to clipboard"""
        clipboard = QApplication.clipboard()
        clipboard.setText(item.text())
        
        # Optional: Show a brief confirmation (you could also use a status bar)
        original_text = item.text()
        item.setText(f"Copied: {original_text}")
        QApplication.processEvents()  # Update the display
        
        # Reset the text after a short delay
        import threading
        def reset_text():
            import time
            time.sleep(1)
            item.setText(original_text)
        
        thread = threading.Thread(target=reset_text)
        thread.daemon = True
        thread.start()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = FileSearcherApp()
    window.show()
    sys.exit(app.exec())