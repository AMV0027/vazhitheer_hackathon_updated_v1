
# Indisafe.ai

Indisafe.ai is an intelligent, culturally aware message translation and dissemination system. It leverages advanced AI technologies to deliver precise translations tailored to various languages and cultural nuances.

---

## Pre-requisites

### Software Requirements:
1. **Python** (>=3.8 recommended)
2. **Node.js** (>=14.0.0)

### Required Python Libraries:
The following libraries are required to run the Python-based backend:
- `fastapi`
- `pydantic`
- `typing`
- `huggingface_hub`
- `asyncio`
- `openai`
- `streamlit`

#### Installing Required Python Libraries:
Run the following command in your terminal to install all dependencies:
```bash
pip install fastapi pydantic typing huggingface_hub asyncio openai streamlit
```

## Instructions to Run the **Indisafe.ai Algorithm** Standalone

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Depending on the AI provider you want to use, execute the respective Python script:
   - For the **Hugging Face version**, run:
     ```bash
     python frontend_ai_HF.py
     ```
   - For the **OpenAI version**, run:
     ```bash
     python frontend_ai_openAi.py
     ```

---

## Instructions to Run the **Indisafe.ai Application**

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Start the backend server based on the AI provider of your choice:
   - **Hugging Face version**:
     ```bash
     python backend_HF_ai.py
     ```
   - **OpenAI version**:
     ```bash
     python backend_ai_openAi.py
     ```

3. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
4. Install required Node.js dependencies:
   ```bash
   npm install
   ```
5. Launch the frontend application:
   ```bash
   npm run dev
   ```

---

## Additional Notes

- Ensure you have all environment variables configured for authentication with Hugging Face and OpenAI APIs. This might include API keys and specific configuration files.
- The backend server and frontend app must run simultaneously for the app to function correctly.
- By default, the app is hosted at `http://localhost:3000` for the frontend. The backend server typically runs at `http://localhost:8000`.

---

## Troubleshooting

1. **ModuleNotFoundError**: If a Python library is missing, double-check the installation of dependencies using the `pip install` command listed above.
2. **Backend Fails to Start**: Ensure all required environment variables (API keys, etc.) are correctly set.
3. **Frontend Issues**: Verify Node.js is installed and dependencies have been properly set up with `npm install`.

Feel free to open an issue or reach out for further assistance.

Team Bytebuddies:
members: 
1. Arunmozhi varman K [+91 7094296432]
2. Nagasanthoshini K [+91 9944248527]
3. Mohana Priya N [+91 9489434933]
