#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import registry from './registry.json' with { type: 'json' }
import { createServer } from './server'
import type { Registry } from './registry.types'

const server = createServer(registry as Registry)
await server.connect(new StdioServerTransport())
