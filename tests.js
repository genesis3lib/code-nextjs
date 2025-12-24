/**
 * Genesis3 Module Test Configuration - Next.js Code Generator
 *
 * Tests the Next.js project scaffolding including:
 * - App Router configuration
 * - TypeScript setup
 * - Tailwind CSS integration
 * - Environment configuration
 * - CI/CD workflow generation
 * - Static vs SSR rendering modes
 */

module.exports = {
  moduleId: 'code-nextjs',
  moduleName: 'Next.js Frontend',

  scenarios: [
    {
      name: 'nextjs-15-static',
      description: 'Next.js 15 with static export - S3/CloudFront deployment',
      config: {
        moduleId: 'nextjs-static',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '15',
          renderingMode: 'static'
        }
      },
      expectedFiles: [
        'frontend/package.json',
        'frontend/tsconfig.json',
        'frontend/next.config.ts',
        'frontend/src/app/layout.tsx',
        'frontend/src/app/page.tsx',
        'frontend/.env.local',
        'frontend/src/lib/utils.ts',
        'frontend/src/utils/version.ts'
      ],
      fileContentChecks: [
        {
          file: 'frontend/next.config.ts',
          contains: [
            'output: \'export\'', // Static export mode
            'NextConfig'
          ]
        },
        {
          file: 'frontend/package.json',
          contains: [
            'next',
            'react',
            'typescript',
            'tailwindcss',
            'lucide-react'
          ]
        },
        {
          file: 'frontend/tsconfig.json',
          contains: [
            'compilerOptions',
            'strict',
            '@/*'
          ]
        }
      ]
    },
    {
      name: 'nextjs-15-ssr',
      description: 'Next.js 15 with SSR - EC2 deployment',
      config: {
        moduleId: 'nextjs-ssr',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '15',
          renderingMode: 'ssr'
        }
      },
      expectedFiles: [
        'frontend/package.json',
        'frontend/next.config.ts',
        'frontend/src/app/ssr/v1/health/route.ts',
        'frontend/Dockerfile.dev'
      ],
      fileContentChecks: [
        {
          file: 'frontend/next.config.ts',
          notContains: [
            'output: \'export\'' // Should NOT have static export
          ]
        },
        {
          file: 'frontend/src/app/ssr/v1/health/route.ts',
          contains: [
            'GET',
            'Response',
            'health',
            'status'
          ]
        }
      ]
    },
    {
      name: 'nextjs-14-static',
      description: 'Next.js 14 with static export - legacy stable version',
      config: {
        moduleId: 'nextjs-14-static',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '14',
          renderingMode: 'static'
        }
      },
      expectedFiles: [
        'frontend/package.json',
        'frontend/next.config.ts',
        'frontend/src/app/layout.tsx'
      ],
      fileContentChecks: [
        {
          file: 'frontend/package.json',
          contains: [
            'next',
            'react'
          ]
        }
      ]
    },
    {
      name: 'nextjs-environment-config',
      description: 'Next.js environment configuration - verify env file structure',
      config: {
        moduleId: 'nextjs-env',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '15',
          renderingMode: 'static'
        }
      },
      expectedFiles: [
        'frontend/.env.local'
      ],
      fileContentChecks: [
        {
          file: 'frontend/.env.local',
          contains: [
            'NEXT_PUBLIC_APP_NAME',
            'NEXT_PUBLIC_APP_HOST',
            'NEXT_PUBLIC_API_BASE'
          ]
        }
      ]
    },
    {
      name: 'nextjs-cicd-workflow',
      description: 'Next.js CI/CD workflow - verify GitHub Actions configuration',
      config: {
        moduleId: 'nextjs-cicd',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '15',
          renderingMode: 'static'
        }
      },
      expectedFiles: [
        '.github/workflows/Code-200-client.yml'
      ],
      fileContentChecks: [
        {
          file: '.github/workflows/Code-200-client.yml',
          contains: [
            'name:',
            'on:',
            'jobs:',
            'npm',
            'node',
            'frontend'
          ]
        }
      ]
    },
    {
      name: 'nextjs-ops-scripts',
      description: 'Next.js ops scripts for EC2 deployment',
      config: {
        moduleId: 'nextjs-ops',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '15',
          renderingMode: 'ssr'
        }
      },
      expectedFiles: [
        'ops/ec2-setup/init-nextjs.sh',
        'ops/ec2-setup/nextjs.service'
      ],
      fileContentChecks: [
        {
          file: 'ops/ec2-setup/init-nextjs.sh',
          contains: [
            '#!/bin/bash',
            'npm',
            'install'
          ]
        },
        {
          file: 'ops/ec2-setup/nextjs.service',
          contains: [
            '[Unit]',
            '[Service]',
            'npm',
            'start'
          ]
        }
      ]
    },
    {
      name: 'nextjs-tailwind-integration',
      description: 'Next.js Tailwind CSS integration - verify configuration',
      config: {
        moduleId: 'nextjs-tailwind',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '15',
          renderingMode: 'static'
        }
      },
      expectedFiles: [
        'frontend/package.json',
        'frontend/src/lib/utils.ts'
      ],
      fileContentChecks: [
        {
          file: 'frontend/package.json',
          contains: [
            'tailwindcss',
            'tailwind-merge',
            'clsx',
            'class-variance-authority'
          ]
        },
        {
          file: 'frontend/src/lib/utils.ts',
          contains: [
            'tailwind-merge',
            'clsx',
            'cn'
          ]
        }
      ]
    },
    {
      name: 'nextjs-local-dev-scripts',
      description: 'Next.js local development scripts',
      config: {
        moduleId: 'nextjs-local',
        kind: 'code',
        type: 'nextjs',
        providers: ['nextjs'],
        enabled: true,
        fieldValues: {
          nextjsVersion: '15',
          renderingMode: 'static'
        }
      },
      expectedFiles: [
        'docker-compose.yaml',
        'kill-local.sh',
        'local.sh'
      ],
      fileContentChecks: [
        {
          file: 'docker-compose.yaml',
          contains: [
            'version:',
            'services:',
            'frontend'
          ]
        },
        {
          file: 'local.sh',
          contains: [
            '#!/bin/bash',
            'npm'
          ]
        }
      ]
    }
  ]
};
