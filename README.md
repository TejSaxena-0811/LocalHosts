# Protego – AI-Powered Threat Detection Tool

## Overview
Protego is an AI-driven threat detection system that analyzes product specifications and system diagrams to identify potential security threats, attack scenarios, and mitigation strategies.

It leverages Large Language Models (GPT-4o via Azure) to automate threat modeling and assist developers in building secure systems more efficiently.

## Key Features
- Upload Product Specification files (.docx)
- Upload System Design diagrams (PlantUML / Draw.io)
- AI-generated:
  - Threat scenarios
  - Security risks
  - Countermeasures
  - Severity levels
- Interactive diagram editing support (Draw.io integration)

## Tech Stack
- Frontend: React.js, Tailwind CSS
- Backend: Python Flask
- AI Integration: Azure OpenAI (GPT-4o model)
- Database: GCP
- Tools: Draw.io, PlantUML

## How It Works
1. Upload product specification document
2. Upload system design diagram
3. Backend parses and processes the files
4. Data is sent to GPT-4o with a structured prompt
5. AI generates threats and mitigation strategies
6. Results are displayed and stored with metadata

## Project Structure
- /frontend
- /backend
- /database
- /threats

## Goal
To simplify and automate threat modeling, making security analysis faster, scalable, and more accessible for developers and organizations.
