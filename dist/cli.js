#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
(0, server_1.startStdioServer)().catch((err) => {
    console.error("[guardbee-gateway] Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map