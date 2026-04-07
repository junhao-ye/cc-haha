import path from 'node:path'
import { pathToFileURL } from 'node:url'

const { appRoot, args } = parseLauncherArgs()

process.env.CLAUDE_APP_ROOT = appRoot
process.env.CALLER_DIR ||= process.cwd()
process.argv = [process.argv[0]!, process.argv[1]!, ...args]

const preloadEntrypoint = pathToFileURL(path.join(appRoot, 'preload.ts')).href
const cliEntrypoint = pathToFileURL(path.join(appRoot, 'src/entrypoints/cli.tsx')).href
await import(preloadEntrypoint)
await import(cliEntrypoint)

function parseLauncherArgs() {
  const rawArgs = process.argv.slice(2)
  const nextArgs: string[] = []
  let appRoot: string | null = process.env.CLAUDE_APP_ROOT ?? null

  for (let index = 0; index < rawArgs.length; index++) {
    const arg = rawArgs[index]
    if (arg === '--app-root') {
      appRoot = rawArgs[index + 1] ?? null
      index += 1
      continue
    }
    nextArgs.push(arg)
  }

  if (!appRoot) {
    throw new Error('Missing --app-root for claude-cli sidecar')
  }

  return { appRoot, args: nextArgs }
}
