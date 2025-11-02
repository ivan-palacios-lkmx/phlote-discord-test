/**
 * ESLint rule to enforce using alias imports (@/) instead of relative imports (../ or ./)
 */
module.exports = {
  rules: {
    "use-alias": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Enforce using alias imports instead of relative imports",
          category: "Best Practices",
        },
        fixable: "code",
        schema: [
          {
            type: "object",
            properties: {
              allowSameFolder: {
                type: "boolean",
                default: true,
              },
              maxDepth: {
                type: "number",
                default: 2,
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          useAlias: "Use alias import '@/' instead of relative import",
          useAliasWithPath: "Replace '{{relative}}' with '{{suggested}}'",
        },
      },

      create(context) {
        const options = context.options[0] || {};
        const allowSameFolder = options.allowSameFolder !== false;
        const maxDepth = options.maxDepth || 2;

        // Helper to check if a path should be converted to alias
        function shouldUseAlias(source, filename) {
          // Skip node_modules, absolute paths, data URIs, and external URLs
          if (
            source.startsWith("node_modules") ||
            source.startsWith("/") ||
            source.startsWith("http://") ||
            source.startsWith("https://") ||
            source.startsWith("data:")
          ) {
            return false;
          }

          // Skip if already using alias
          if (source.startsWith("@/")) {
            return false;
          }

          // Check for relative imports
          if (source.startsWith("../") || (source.startsWith("./") && source.length > 2)) {
            // Allow same-folder imports if configured
            if (allowSameFolder && source.startsWith("./")) {
              return false;
            }
            return true;
          }

          return false;
        }

        // Helper to convert relative path to alias path
        function convertToAlias(relativePath, currentFile) {
          const fs = require("path");
          // Remove the file extension and determine the project root
          const root = process.cwd();
          const currentDir = fs.dirname(currentFile);
          const targetPath = fs.resolve(currentDir, relativePath);

          // Calculate relative path from root
          const relativeFromRoot = fs.relative(root, targetPath);

          // Convert to forward slashes and ensure it starts with @/
          const aliasPath = relativeFromRoot.replace(/\\/g, "/");

          // If the path doesn't start with @/, add it
          return aliasPath.startsWith("@/") ? aliasPath : `@/${aliasPath}`;
        }

        return {
          ImportDeclaration(node) {
            if (!node.source || !node.source.value) {
              return;
            }

            const sourceValue = node.source.value;
            const filename = context.getFilename();

            if (shouldUseAlias(sourceValue, filename)) {
              // Check depth
              const depth = (sourceValue.match(/\.\.\//g) || []).length;

              if (depth > maxDepth) {
                return; // Skip if too deep
              }

              const suggested = convertToAlias(sourceValue, filename);

              context.report({
                node: node.source,
                messageId: "useAliasWithPath",
                data: {
                  relative: sourceValue,
                  suggested: suggested,
                },
                fix(fixer) {
                  return fixer.replaceText(node.source, `"${suggested}"`);
                },
              });
            }
          },
        };
      },
    },
  },
};
