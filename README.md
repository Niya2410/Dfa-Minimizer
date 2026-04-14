# DFA Minimization Visualizer

## Project Overview
This project is an interactive, visualization-based web application developed for the course Theory of Automata and Formal Languages (TAFL). It demonstrates the process of minimizing a Deterministic Finite Automaton (DFA) using the Partitioning Method, based on the Myhill-Nerode Theorem. The tool not only performs minimization but also provides a step-by-step explanation and graphical visualization of both the original and minimized DFA. This project is designed as an educational tool to help students better understand DFA minimization through interactive visualization and theory integration.

## Features
- User-defined DFA input (states, input symbols, transitions)
- Step-by-step minimization using partition refinement
- Built-in theory explanation (Myhill-Nerode + Partitioning)
- Interactive "Next Step" visualization
- Graphical display of **Original DFA**
- Graphical display of **Minimized DFA**
- Start state arrow representation
- Directed transitions with arrows
- Final states highlighted distinctly

## Concepts Implemented
- DFA Minimization
- Myhill-Nerode Theorem
- Partition Refinement Algorithm
- Equivalent State Detection
- State Merging

## Technologies Used
- **HTML** – Structure of the application  
- **CSS** – Styling and UI design  
- **JavaScript** – Core logic and interactivity  
- **Cytoscape.js** – Graph visualization of automata  

## How to Run
1. Clone or download the repository
2. Open `index.html` in any web browser
3. Enter DFA details:
   - States
   - Input Symbols
   - Start State
   - Final States
   - Transitions
4. Click **"Minimize & Visualize"**
5. Use **Next Step** to observe the minimization process

## Output
The application displays:
- Step-by-step partitioning (P₀, P₁, P₂...)
- Original DFA graph
- Minimized DFA graph
- Explanation of state splitting

## Live Demo
https://niya2410.github.io/dfa-minimization-visualizer/

## 👩‍💻 Author
Navya Khoba 
