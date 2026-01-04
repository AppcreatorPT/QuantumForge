# Project Structure: TradeOS Gemini

This project is organized into three main components:

## 1. 📂 knowledge-base
**Purpose:** Stores the "Brain" / Documentation.
*   The AI uses files in this directory to understand valid Pine Script syntax and Logic.
*   **Key File:** `pine_script_v6_rules.md` (Contains rules for the latest 2025 version).

## 2. 📂 backend (To Be Implemented)
**Purpose:** The logic layer.
*   **Tech:** Firebase Functions.
*   **Job:** Receives chat requests -> Reads `knowledge-base` -> Queries Gemini API -> Returns code.

## 3. 📂 frontend (To Be Implemented)
**Purpose:** The User Interface.
*   **Tech:** React + Vite.
*   **Job:** Interactive chat interface, charts, and strategy visualization.
