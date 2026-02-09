/** Mock vscode module for extension tests. */

export const mockCmd = jest.fn();
const mockDisposable = { dispose: jest.fn() };

export const commands = {
  registerCommand: jest.fn((_id: string, handler: () => void | Promise<void>) => {
    mockCmd.mockImplementation(handler);
    return mockDisposable;
  }),
};

export const mockPostMessage = jest.fn();
let receivedMessageHandler: ((e: unknown) => void) | null = null;
export const mockOnDidReceiveMessage = jest.fn((cb: (e: unknown) => void) => {
  receivedMessageHandler = cb;
  return { dispose: jest.fn() };
});
export const triggerWebviewMessage = (msg: unknown) => {
  receivedMessageHandler?.(msg);
};
export const mockShowTextDocument = jest.fn().mockResolvedValue({
  revealRange: jest.fn(),
  selection: {},
});

export const window = {
  activeTextEditor: undefined as unknown,
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showTextDocument: mockShowTextDocument,
  createWebviewPanel: jest.fn(() => ({
    webview: {
      html: "",
      postMessage: mockPostMessage,
      onDidReceiveMessage: mockOnDidReceiveMessage,
      asWebviewUri: jest.fn((uri: { path: string }) => ({ toString: () => `vscode-resource:${uri.path}` })),
    },
    onDidDispose: jest.fn(() => ({ dispose: jest.fn() })),
    reveal: jest.fn(),
  })),
};

export const Uri = {
  file: jest.fn((p: string) => ({ path: p, fsPath: p })),
  joinPath: jest.fn((base: { path: string }, ...segments: string[]) => {
    const joined = [base.path, ...segments].join("/").replace(/\/+/g, "/");
    return { path: joined, fsPath: joined };
  }),
};
export const ViewColumn = { One: 1, Beside: 2 };
export const Position = jest.fn((line: number, character: number) => ({
  line,
  character,
}));
export const Range = jest.fn((start: unknown, end: unknown) => ({
  start,
  end,
}));
export const Selection = jest.fn((anchor: unknown, active: unknown) => ({
  anchor,
  active,
}));
export const TextEditorRevealType = { InCenter: 1 };
