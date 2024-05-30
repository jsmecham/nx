import * as memfs from 'memfs';

import '../../internal-testing-utils/mock-fs';
import { createNodeFromPackageJson } from './create-nodes';

describe('nx package.json workspaces plugin', () => {
  it('should build projects from package.json files', () => {
    memfs.vol.fromJSON(
      {
        'package.json': JSON.stringify({
          name: 'root',
          scripts: { echo: 'echo root project' },
        }),
        'packages/lib-a/package.json': JSON.stringify({
          name: 'lib-a',
          description: 'lib-a description',
          scripts: { test: 'jest' },
        }),
        'packages/lib-b/package.json': JSON.stringify({
          name: 'lib-b',
          description: 'lib-b description',
          scripts: {
            build: 'tsc',
            test: 'jest',
            nonNxOperation: 'rm -rf .',
          },
          nx: {
            implicitDependencies: ['lib-a'],
            includedScripts: ['build', 'test'],
            targets: {
              build: {
                outputs: ['{projectRoot}/dist'],
              },
            },
          },
        }),
      },
      '/root'
    );

    expect(createNodeFromPackageJson('package.json', '/root'))
      .toMatchInlineSnapshot(`
      {
        "projects": {
          ".": {
            "description": undefined,
            "metadata": {
              "targetGroups": {
                "NPM Scripts": [
                  "echo",
                ],
              },
            },
            "name": "root",
            "projectType": "library",
            "root": ".",
            "sourceRoot": ".",
            "tags": [
              "npm:public",
            ],
            "targets": {
              "echo": {
                "executor": "nx:run-script",
                "metadata": {
                  "runCommand": "npm run echo",
                  "scriptContent": "echo root project",
                },
                "options": {
                  "script": "echo",
                },
              },
              "nx-release-publish": {
                "dependsOn": [
                  "^nx-release-publish",
                ],
                "executor": "@nx/js:release-publish",
                "options": {},
              },
            },
          },
        },
      }
    `);
    expect(createNodeFromPackageJson('packages/lib-a/package.json', '/root'))
      .toMatchInlineSnapshot(`
      {
        "projects": {
          "packages/lib-a": {
            "description": "lib-a description",
            "metadata": {
              "targetGroups": {
                "NPM Scripts": [
                  "test",
                ],
              },
            },
            "name": "lib-a",
            "projectType": "library",
            "root": "packages/lib-a",
            "sourceRoot": "packages/lib-a",
            "tags": [
              "npm:public",
            ],
            "targets": {
              "nx-release-publish": {
                "dependsOn": [
                  "^nx-release-publish",
                ],
                "executor": "@nx/js:release-publish",
                "options": {},
              },
              "test": {
                "executor": "nx:run-script",
                "metadata": {
                  "runCommand": "npm run test",
                  "scriptContent": "jest",
                },
                "options": {
                  "script": "test",
                },
              },
            },
          },
        },
      }
    `);
    expect(createNodeFromPackageJson('packages/lib-b/package.json', '/root'))
      .toMatchInlineSnapshot(`
      {
        "projects": {
          "packages/lib-b": {
            "description": "lib-b description",
            "implicitDependencies": [
              "lib-a",
            ],
            "includedScripts": [
              "build",
              "test",
            ],
            "metadata": {
              "targetGroups": {
                "NPM Scripts": [
                  "build",
                  "test",
                ],
              },
            },
            "name": "lib-b",
            "projectType": "library",
            "root": "packages/lib-b",
            "sourceRoot": "packages/lib-b",
            "tags": [
              "npm:public",
            ],
            "targets": {
              "build": {
                "executor": "nx:run-script",
                "metadata": {
                  "runCommand": "npm run build",
                  "scriptContent": "tsc",
                },
                "options": {
                  "script": "build",
                },
                "outputs": [
                  "{projectRoot}/dist",
                ],
              },
              "nx-release-publish": {
                "dependsOn": [
                  "^nx-release-publish",
                ],
                "executor": "@nx/js:release-publish",
                "options": {},
              },
              "test": {
                "executor": "nx:run-script",
                "metadata": {
                  "runCommand": "npm run test",
                  "scriptContent": "jest",
                },
                "options": {
                  "script": "test",
                },
              },
            },
          },
        },
      }
    `);
  });
});
