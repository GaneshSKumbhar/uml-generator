<div align="center">

# 🎨 UML Studio

### Draw UML class diagrams → get Java code instantly ⚡

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?logo=vite&logoColor=white)
![React Flow](https://img.shields.io/badge/React%20Flow-Canvas-ff0072)
![JSZip](https://img.shields.io/badge/JSZip-Export-orange)
![Theme](https://img.shields.io/badge/Theme-Light%20%2F%20Dark-111827)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📖 Overview

**UML Studio** is a browser-based tool for designing **UML class diagrams** on an interactive canvas and generating matching **Java source code** in real time. 🚀

Build your design visually, validate it, save it as JSON, and export the generated code as a ZIP, all without leaving the browser. 🌐

## 📸 Screenshot

<div align="center">

![UML Studio screenshot](/app.png)

*Class diagram on the canvas (left and centre) with the generated Java code (right) in dark mode* 🌙

</div>

---

## 📑 Table of Contents

- [📸 Screenshot](#-screenshot)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📂 Project Structure](#-project-structure)
- [🧭 How to Use](#-how-to-use)
- [🔗 Relationships → Java](#-relationships--java)
- [✅ Diagram Checks](#-diagram-checks)
- [💾 Save, Load and Export](#-save-load-and-export)
- [🧪 Quick Test Checklist](#-quick-test-checklist)
- [🩺 Troubleshooting](#-troubleshooting)
- [🗺️ Roadmap](#️-roadmap)
- [📝 License](#-license)

---

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 🖥️ | **Dashboard UI** | Top bar, collapsible sidebar and collapsible code panel |
| 🧩 | **Drag-and-drop canvas** | Zoom, pan, controls and mini-map powered by React Flow |
| 📦 | **3 element types** | 🟦 Class, 🟨 Abstract class, 🟪 Interface |
| 🔗 | **5 relationship types** | Inheritance, Realization, Association, Aggregation, Composition |
| ✏️ | **Relationship editor** | Click an arrow to change type, 🔄 reverse it or 🗑️ delete it |
| ☕ | **Live Java generator** | Real-time code with line numbers and syntax colors |
| ⚙️ | **Java options** | Package name, constructors on/off, getters/setters on/off |
| ✅ | **Diagram checks** | Warns about duplicates, empty names, multiple `extends`, wrong relationships |
| 💾 | **Save / Load JSON** | Keep your diagram as a file and restore it anytime |
| 📥 | **Export** | Copy code, download one `.java` file, or a full 📦 ZIP |
| 🌗 | **Light / Dark theme** | CSS variables, remembered between visits |
| 🔁 | **Autosave** | Your work is stored in the browser automatically |
| 🏷️ | **Project name + live counts** | Editable title, classes and relations counters |

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| ⚛️ UI framework | React (JSX) |
| ⚡ Build tool | Vite |
| 🕸️ Diagram canvas | [React Flow](https://reactflow.dev/) (`reactflow`) |
| 🗜️ ZIP export | [JSZip](https://stuk.github.io/jszip/) |
| 🎨 Styling | Plain CSS with theme variables |

---

## 🚀 Getting Started

### 📋 Prerequisites

- 🟢 [Node.js](https://nodejs.org/) 18 or newer
- 📦 npm

### 🔧 Installation

```bash
# 1️⃣ Create the project (skip if you already have it)
npm create vite@latest uml-studio -- --template react
cd uml-studio

# 2️⃣ Install dependencies
npm install
npm install reactflow jszip

# 3️⃣ Start the dev server
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`). 🎉

### 🏗️ Build for production

```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```text
src/
├── main.jsx                # 🚪 Entry point
├── App.jsx                 # 🧠 State, canvas, save/load, layout
├── App.css                 # 🎨 Styles + light/dark theme variables
├── components/
│   ├── ClassNode.jsx       # 📦 The UML box (name, attributes, methods)
│   ├── CodePanel.jsx       # ☕ Java output: tabs, highlighting, copy/download/ZIP
│   ├── Sidebar.jsx         # 🎛️ Add elements, relationships, options, checks, project actions
│   └── Icons.jsx           # 🖼️ Inline SVG icon set
└── utils/
    ├── constants.js        # 🔗 Relationship types, visibility options and symbols
    ├── javaGenerator.js    # ⚙️ Converts nodes + edges into Java files
    ├── validate.js         # ✅ Diagram checks (errors and warnings)
    └── download.js         # 📥 Download a Blob as a file
```

> ⚠️ `main.jsx` must wrap `<App />` in `<ReactFlowProvider>`, because `App.jsx` uses the `useReactFlow` hook.

---

## 🧭 How to Use

1. ➕ **Add elements:** click **Class**, **Abstract** or **Interface** in the sidebar. The box appears in the middle of the canvas.
2. ✍️ **Name it and add members:** type a name in the header, then add attributes and methods.
3. 🔗 **Pick a relationship type** in the sidebar (default: Inheritance).
4. 🖱️ **Connect boxes:** drag from the **bottom dot** of one box to the **top dot** of another.
5. 🎯 **Edit a relationship:** click an arrow, then change its type, press **Reverse**, or delete it.
   For inheritance, the arrow must point **from the child to the parent**.
6. 🔍 **Check the diagram:** fix anything shown under *Diagram checks*.
7. ☕ **Get your code** from the right panel: copy, download one `.java` file, or download the ZIP.

### 👁️ Visibility symbols

| Symbol | Meaning |
|:------:|---------|
| `+` | 🌍 public |
| `-` | 🔒 private |
| `#` | 🛡️ protected |
| `~` | 📁 package |

---

## 🔗 Relationships → Java

| Relationship | Line style | Java result |
|--------------|-----------|-------------|
| 🔵 **Inheritance** | Solid, closed arrow | `class Child extends Parent` |
| 🟣 **Realization** | Dashed, closed arrow | `class Impl implements Interface` |
| ⚪ **Association** | Solid, open arrow | Adds a field of the other type |
| 🟢 **Aggregation** | Solid, open arrow | Adds a `List<Other>` field |
| 🔴 **Composition** | Solid, open arrow | Adds an owned field (part-of) |

---

## ✅ Diagram Checks

The sidebar warns you live about:

- ❌ Duplicate class names
- ⚠️ Classes with empty names
- ⚠️ Names that are not valid Java identifiers
- ❌ A class that `extends` more than one class (Java allows only one)
- ❌ An interface extending a class
- ⚠️ Using Inheritance to implement an interface (use Realization instead)
- ⚠️ Realization pointing to something that is not an interface

When everything is fine you will see: ✅ **No problems found**

---

## 💾 Save, Load and Export

| Action | What it does |
|--------|--------------|
| 💾 **Save** | Downloads `<project-name>.json` (project name, nodes, edges) |
| 📂 **Load** | Restores a diagram from a saved JSON file |
| 🗑️ **Clear diagram** | Removes everything (asks for confirmation first) |
| 📋 **Copy** | Copies the current Java file to the clipboard |
| ☕ **.java** | Downloads the selected Java file |
| 📦 **ZIP** | Downloads all files; with package `com.demo` they land in `com/demo/` |
| 🔁 **Autosave** | Stored in `localStorage` (`uml-diagram-v1`); theme in `uml-theme` |

---

## 🧪 Quick Test Checklist

- [ ] 🌗 Click the moon/sun icon, switch theme, refresh, and confirm it is remembered
- [ ] ➕ Click **Class** and confirm a new box appears mid-canvas
- [ ] 🖱️ Click an arrow, then use **Reverse** to fix a wrong direction
- [ ] ❌ Make a class extend two parents and watch *Diagram checks* show an error
- [ ] 💾 Save, 🗑️ Clear, then 📂 Load to restore the diagram
- [ ] 📦 Set package `com.demo`, download the ZIP, and check the `com/demo/` folders

---

## 🩺 Troubleshooting

| Problem | Fix |
|---------|-----|
| 😵 Page looks odd after updating files | Stop the server (`Ctrl + C`), run `npm run dev`, then hard refresh with `Ctrl + Shift + R` |
| 💥 `useReactFlow` error | Wrap `<App />` in `<ReactFlowProvider>` in `main.jsx` |
| 📦 Import error for `reactflow` or `jszip` | Run `npm install reactflow jszip` |
| ✂️ Method parameters look cut off | Make sure the params input in `ClassNode.jsx` uses `className="nodrag params"` |

---

## 🗺️ Roadmap

- [ ] 🖼️ Export the diagram as PNG / SVG
- [ ] ↩️ Undo / redo
- [ ] 🔢 Multiplicity labels (`1..*`, `0..1`)
- [ ] 🏷️ Enums and static members
- [ ] 📥 Import existing Java code into a diagram

---

## 📝 License

Released under the **MIT License** 🆓. Free to use for learning, academic projects and more.

<div align="center">

Made with ❤️ using React and React Flow

⭐ If you like this project, give it a star! ⭐

</div>