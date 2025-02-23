export function getRendererInfo(): { renderer: string; vendor: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext;

    if (!gl) {
      return { renderer: "Unknown", vendor: "Unknown" };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : null;
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : null;

    return {
      renderer: renderer || "Unknown",
      vendor: vendor || "Unknown",
    };
  } catch (e) {
    console.warn("Unable to get WebGL renderer info:", e);
    return { renderer: "Unknown", vendor: "Unknown" };
  }
}
