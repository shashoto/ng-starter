import { Tree, SchematicContext } from '@angular-devkit/schematics';

/**
 * Logs all newly created or modified files during a schematic run.
 */
export function logCopiedFiles(
  tree: Tree,
  context: SchematicContext,
  basePath: string = ''
): void {
  const createdFiles: string[] = [];
  const updatedFiles: string[] = [];

  // Go through all actions performed on the Tree
  for (const record of (tree as any).actions ?? []) {
    if (record.kind === 'create') {
      createdFiles.push(record.path);
    } else if (record.kind === 'overwrite') {
      updatedFiles.push(record.path);
    }
  }

  context.logger.info('\n🧱 Files copied or modified:\n');

  if (createdFiles.length > 0) {
    createdFiles.forEach(file => {
      context.logger.info(`✅ Created: ${basePath}${file}`);
    });
  }

  if (updatedFiles.length > 0) {
    updatedFiles.forEach(file => {
      context.logger.info(`♻️ Updated: ${basePath}${file}`);
    });
  }

  if (createdFiles.length === 0 && updatedFiles.length === 0) {
    context.logger.warn('⚠️ No new files were created or modified.');
  }

  context.logger.info('\n--------------------------------------\n');
}
