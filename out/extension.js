"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("python-ast.visualize", () => {
        vscode.window.showInformationMessage("Python AST Visualization - Placeholder");
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map