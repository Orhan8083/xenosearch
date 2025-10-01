from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import subprocess
import json
import os
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
CSV_FILE = "SB Publication PMC.csv"
OLLAMA_URL = "http://localhost:11434/api/generate"

def load_csv_data():
    """Load and preprocess CSV data for context"""
    try:
        df = pd.read_csv(CSV_FILE)
        
        # Create a meaningful context from CSV columns and sample data
        context_lines = []
        
        # Add column information
        context_lines.append(f"Available columns: {', '.join(df.columns.tolist())}")
        
        # Add sample data from first few rows (adjust as needed)
        sample_size = min(3, len(df))
        for idx, row in df.head(sample_size).iterrows():
            row_info = [f"{col}: {row[col]}" for col in df.columns if pd.notna(row[col])]
            context_lines.append(f"Sample row {idx+1}: {'; '.join(row_info)}")
        
        # Add basic statistics for numeric columns
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            context_lines.append("Numeric columns statistics:")
            for col in numeric_cols:
                context_lines.append(f"  {col}: min={df[col].min()}, max={df[col].max()}, mean={df[col].mean():.2f}")
        
        return "\n".join(context_lines)
    
    except Exception as e:
        return f"Error loading CSV data: {str(e)}"

def query_ollama(question, csv_context):
    """Query Ollama DeepSeek R1 with CSV context"""
    
    # Enhanced prompt to focus on CSV data
    prompt = f"""You are a data analysis assistant. Based on the following CSV data structure and content, please answer the user's question.

CSV Data Context:
{csv_context}

User Question: {question}

Please:
1. Answer based ONLY on the CSV data provided above
2. If the question cannot be answered with the available data, explain what information is missing
3. Be precise and factual
4. Reference specific columns or data points when relevant

Answer:"""
    
    try:
        # Prepare the request for Ollama
        ollama_request = {
            "model": "deepseek-r1",
            "prompt": prompt,
            "stream": False
        }
        
        # Convert to JSON string for curl
        json_input = json.dumps(ollama_request)
        
        # Call Ollama via subprocess
        result = subprocess.run([
            'curl', '-s', '-X', 'POST', OLLAMA_URL,
            '-H', 'Content-Type: application/json',
            '-d', json_input
        ], capture_output=True, text=True, timeout=120)
        
        if result.returncode == 0:
            response_data = json.loads(result.stdout)
            return response_data.get('response', 'No response received from AI model')
        else:
            return f"Error querying Ollama: {result.stderr}"
            
    except subprocess.TimeoutExpired:
        return "Error: Request timeout - Ollama service may be unavailable"
    except Exception as e:
        return f"Error communicating with Ollama: {str(e)}"

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """API endpoint to handle AI questions"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        # Load CSV context
        csv_context = load_csv_data()
        
        # Query Ollama
        answer = query_ollama(question, csv_context)
        
        return jsonify({
            'question': question,
            'answer': answer,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    # Check if CSV file exists
    if not os.path.exists(CSV_FILE):
        print(f"Warning: CSV file '{CSV_FILE}' not found in current directory")
    
    app.run(host='0.0.0.0', port=5000, debug=True)