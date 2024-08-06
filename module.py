# module.py
import os
import hashlib
import shutil

def calculate_hash_helper(file_path, hash_algo=hashlib.md5, chunk_size=4096):
    hash_obj = hash_algo()
    with open(file_path, "rb") as file:
        for chunk in iter(lambda: file.read(chunk_size), b""):
            hash_obj.update(chunk)
    return hash_obj.hexdigest()


def find_duplicate_pdfs_helper( folder="C:/Users/nares/Desktop/LAB/Thesis/３．参考文献(PDF)Reference",):
    pdf_hashes = {}
    duplicates = []

    for root, _, files in os.walk(folder):
        for file in files:
            if file.lower().endswith(".pdf"):
                file_path = os.path.join(root, file)
                file_hash = calculate_hash_helper(file_path)

                if file_hash in pdf_hashes:
                    duplicates.append((file_path, pdf_hashes[file_hash]))
                else:
                    pdf_hashes[file_hash] = file_path

    return duplicates


def search_duplicatePDF():
    # Usage example:
    duplicates = find_duplicate_pdfs_helper()
    if duplicates:
        print("Duplicate PDF files found:")
        for duplicate, original in duplicates:
            print(f"Duplicate: {duplicate}\nOriginal: {original}\n")
    else:
        print("No duplicate PDF files found.")

def copy_pdfs(src_folder='C:/Users/nares/Zotero/storage', dest_folder='C:/Users/nares/Videos/Captures'):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    for root, dirs, files in os.walk(src_folder):
        for file in files:
            if file.lower().endswith('.pdf'):
                src_file_path = os.path.join(root, file)
                dest_file_path = os.path.join(dest_folder, file)
                shutil.copy2(src_file_path, dest_file_path)
                print(f"Copied {src_file_path} to {dest_file_path}")
