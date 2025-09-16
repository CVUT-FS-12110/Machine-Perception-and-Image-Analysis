import os
import json

def clear_widgets_metadata(notebook_path):
    """Open a notebook, remove 'widgets' section from metadata, and save it."""
    with open(notebook_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "metadata" in data and "widgets" in data["metadata"]:
        print(f"Cleaning widgets metadata in: {notebook_path}")
        del data["metadata"]["widgets"]

        # Save the modified notebook
        with open(notebook_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=1, ensure_ascii=False)
    else:
        print(f"No widgets metadata found in: {notebook_path}")

def process_all_notebooks(base_dir="."):
    """Walk through all folders and clean all .ipynb files."""
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.endswith(".ipynb"):
                notebook_path = os.path.join(root, file)
                clear_widgets_metadata(notebook_path)

if __name__ == "__main__":
    process_all_notebooks(".")
