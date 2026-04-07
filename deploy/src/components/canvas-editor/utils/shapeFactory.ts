/**
 * Factory functions for creating new canvas elements (text, shapes).
 * Used by the "Add Element" toolbar in CanvasEditor.
 */

export function createTextbox(fabricModule: any, canvas: any) {
  const text = new fabricModule.Textbox('텍스트 입력', {
    left: 200,
    top: 200,
    width: 300,
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'Noto Sans KR, sans-serif',
    fill: '#1a1a1a',
    name: '새 텍스트',
    splitByGrapheme: true,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
}

export function createRect(fabricModule: any, canvas: any, accentColor?: string) {
  const rect = new fabricModule.Rect({
    left: 200,
    top: 200,
    width: 200,
    height: 120,
    fill: accentColor || '#3182F6',
    opacity: 0.15,
    rx: 12,
    ry: 12,
    name: '새 사각형',
  });
  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
}

export function createCircle(fabricModule: any, canvas: any, accentColor?: string) {
  const circle = new fabricModule.Circle({
    left: 300,
    top: 200,
    radius: 60,
    fill: accentColor || '#3182F6',
    opacity: 0.15,
    name: '새 원',
  });
  canvas.add(circle);
  canvas.setActiveObject(circle);
  canvas.renderAll();
}

export function createLine(fabricModule: any, canvas: any, accentColor?: string) {
  const line = new fabricModule.Line([200, 300, 660, 300], {
    stroke: accentColor || '#3182F6',
    strokeWidth: 2,
    name: '새 직선',
  });
  canvas.add(line);
  canvas.setActiveObject(line);
  canvas.renderAll();
}
