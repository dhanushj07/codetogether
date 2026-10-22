import { SupportedLanguage, Problem } from '../types';

export interface LanguageMeta {
  id: SupportedLanguage;
  name: string;
  category: string;
  extension: string;
  filename: string;
  monacoLang: string;
  pistonLang: string;
  judge0Id: number;
  badgeColor: string;
  popular?: boolean;
}

export const ALL_SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    id: 'python',
    name: 'Python 3',
    category: 'Dynamic',
    extension: 'py',
    filename: 'solution.py',
    monacoLang: 'python',
    pistonLang: 'python',
    judge0Id: 71,
    badgeColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-700/40',
    popular: true,
  },
  {
    id: 'cpp',
    name: 'C++ (G++ 20)',
    category: 'Compiled',
    extension: 'cpp',
    filename: 'solution.cpp',
    monacoLang: 'cpp',
    pistonLang: 'c++',
    judge0Id: 54,
    badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-700/40',
    popular: true,
  },
  {
    id: 'java',
    name: 'Java (OpenJDK 17)',
    category: 'Object-Oriented',
    extension: 'java',
    filename: 'Solution.java',
    monacoLang: 'java',
    pistonLang: 'java',
    judge0Id: 62,
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-700/40',
    popular: true,
  },
  {
    id: 'javascript',
    name: 'JavaScript (Node.js 20)',
    category: 'Web',
    extension: 'js',
    filename: 'solution.js',
    monacoLang: 'javascript',
    pistonLang: 'javascript',
    judge0Id: 63,
    badgeColor: 'text-amber-300 bg-amber-950/50 border-amber-500/40',
    popular: true,
  },
  {
    id: 'typescript',
    name: 'TypeScript 5',
    category: 'Web',
    extension: 'ts',
    filename: 'solution.ts',
    monacoLang: 'typescript',
    pistonLang: 'typescript',
    judge0Id: 74,
    badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-700/40',
    popular: true,
  },
  {
    id: 'c',
    name: 'C (GCC 11)',
    category: 'System',
    extension: 'c',
    filename: 'solution.c',
    monacoLang: 'c',
    pistonLang: 'c',
    judge0Id: 50,
    badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-700/40',
  },
  {
    id: 'csharp',
    name: 'C# (.NET 8)',
    category: 'Enterprise',
    extension: 'cs',
    filename: 'Solution.cs',
    monacoLang: 'csharp',
    pistonLang: 'csharp',
    judge0Id: 51,
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-700/40',
    popular: true,
  },
  {
    id: 'go',
    name: 'Go (Golang 1.21)',
    category: 'Compiled',
    extension: 'go',
    filename: 'main.go',
    monacoLang: 'go',
    pistonLang: 'go',
    judge0Id: 60,
    badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/40',
    popular: true,
  },
  {
    id: 'rust',
    name: 'Rust (rustc 1.75)',
    category: 'Systems',
    extension: 'rs',
    filename: 'solution.rs',
    monacoLang: 'rust',
    pistonLang: 'rust',
    judge0Id: 73,
    badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-700/40',
    popular: true,
  },
  {
    id: 'kotlin',
    name: 'Kotlin 1.9',
    category: 'JVM',
    extension: 'kt',
    filename: 'Solution.kt',
    monacoLang: 'kotlin',
    pistonLang: 'kotlin',
    judge0Id: 78,
    badgeColor: 'text-violet-400 bg-violet-950/60 border-violet-700/40',
  },
  {
    id: 'swift',
    name: 'Swift 5.9',
    category: 'Native',
    extension: 'swift',
    filename: 'Solution.swift',
    monacoLang: 'swift',
    pistonLang: 'swift',
    judge0Id: 83,
    badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-700/40',
  },
  {
    id: 'php',
    name: 'PHP 8.2',
    category: 'Scripting',
    extension: 'php',
    filename: 'solution.php',
    monacoLang: 'php',
    pistonLang: 'php',
    judge0Id: 68,
    badgeColor: 'text-blue-300 bg-blue-950/40 border-blue-600/30',
  },
  {
    id: 'ruby',
    name: 'Ruby 3.2',
    category: 'Scripting',
    extension: 'rb',
    filename: 'solution.rb',
    monacoLang: 'ruby',
    pistonLang: 'ruby',
    judge0Id: 72,
    badgeColor: 'text-red-400 bg-red-950/60 border-red-700/40',
  },
  {
    id: 'dart',
    name: 'Dart 3.2',
    category: 'Multi-platform',
    extension: 'dart',
    filename: 'solution.dart',
    monacoLang: 'dart',
    pistonLang: 'dart',
    judge0Id: 90,
    badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-700/40',
  },
  {
    id: 'scala',
    name: 'Scala 3',
    category: 'Functional',
    extension: 'scala',
    filename: 'Solution.scala',
    monacoLang: 'scala',
    pistonLang: 'scala',
    judge0Id: 81,
    badgeColor: 'text-rose-300 bg-rose-950/50 border-rose-600/30',
  },
  {
    id: 'r',
    name: 'R 4.3',
    category: 'Data Science',
    extension: 'r',
    filename: 'solution.R',
    monacoLang: 'r',
    pistonLang: 'r',
    judge0Id: 80,
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/40',
  },
  {
    id: 'sql',
    name: 'SQL (PostgreSQL)',
    category: 'Database',
    extension: 'sql',
    filename: 'solution.sql',
    monacoLang: 'sql',
    pistonLang: 'sqlite3',
    judge0Id: 82,
    badgeColor: 'text-sky-300 bg-sky-950/50 border-sky-600/40',
  },
  {
    id: 'bash',
    name: 'Bash / Shell',
    category: 'CLI',
    extension: 'sh',
    filename: 'solution.sh',
    monacoLang: 'shell',
    pistonLang: 'bash',
    judge0Id: 46,
    badgeColor: 'text-slate-300 bg-slate-900 border-slate-700',
  },
];

export function getLanguageMeta(lang: SupportedLanguage): LanguageMeta {
  const meta = ALL_SUPPORTED_LANGUAGES.find((l) => l.id === lang);
  return (
    meta || {
      id: lang,
      name: lang,
      category: 'General',
      extension: 'txt',
      filename: `solution.${lang}`,
      monacoLang: 'javascript',
      pistonLang: 'javascript',
      judge0Id: 63,
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
    }
  );
}

/**
 * Derives a clean CamelCase and snake_case identifier for any problem.
 */
function toIdentifiers(slug: string, title: string) {
  const base = (slug || title).replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const words = base.split(/\s+/).filter(Boolean);
  const pascal = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Solve';
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  const snake = words.map((w) => w.toLowerCase()).join('_') || 'solve';
  return { pascal, camel, snake };
}

/**
 * Returns an idiomatic starter template for any supported language.
 * If the problem explicitly has code for this language, it returns it.
 */
export function getStarterCode(problem: Problem, lang: SupportedLanguage): string {
  if (problem.starterCode && problem.starterCode[lang]) {
    return problem.starterCode[lang];
  }

  const { pascal, camel, snake } = toIdentifiers(problem.slug, problem.title);

  switch (lang) {
    case 'python':
      return `class Solution:
    def ${snake}(self, *args):
        # Problem: ${problem.title}
        # Platform: ${problem.platformName || 'LeetCode'}
        # Write your code here
        pass
`;

    case 'cpp':
      return `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    // Problem: ${problem.title}
    auto ${camel}(auto... args) {
        // Write your solution here
        return 0;
    }
};
`;

    case 'java':
      return `import java.util.*;

public class Solution {
    // Problem: ${problem.title}
    // Platform: ${problem.platformName || 'LeetCode'}
    public Object ${camel}(Object... args) {
        // Write your solution here
        return null;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println("CodeTogether Java Environment Ready");
    }
}
`;

    case 'javascript':
      return `/**
 * @param {...any} args
 * @return {any}
 */
function ${camel}(...args) {
  // Problem: ${problem.title}
  // Platform: ${problem.platformName || 'LeetCode'}
  return args[0];
}
`;

    case 'typescript':
      return `function ${camel}(...args: any[]): any {
  // Problem: ${problem.title}
  // Platform: ${problem.platformName || 'LeetCode'}
  return args[0];
}
`;

    case 'c':
      return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

// Problem: ${problem.title}
int ${snake}(int* nums, int numsSize) {
    // Write your solution here
    return 0;
}

int main() {
    printf("C Runner initialized for ${problem.title}\\n");
    return 0;
}
`;

    case 'csharp':
      return `using System;
using System.Collections.Generic;

public class Solution {
    // Problem: ${problem.title}
    public object ${pascal}(params object[] args) {
        // Write your solution here
        return null;
    }
}
`;

    case 'go':
      return `package main

import "fmt"

// Problem: ${problem.title}
func ${camel}(args ...interface{}) interface{} {
    // Write your solution here
    return nil
}

func main() {
    fmt.Println("CodeTogether Go runner ready")
}
`;

    case 'rust':
      return `// Problem: ${problem.title}
struct Solution;

impl Solution {
    pub fn ${snake}() {
        // Write your solution here
    }
}

fn main() {
    println!("Rust compiler initialized");
}
`;

    case 'kotlin':
      return `class Solution {
    // Problem: ${problem.title}
    fun ${camel}(vararg args: Any): Any? {
        // Write your solution here
        return null
    }
}
`;

    case 'swift':
      return `class Solution {
    // Problem: ${problem.title}
    func ${camel}(_ args: Any...) -> Any? {
        // Write your solution here
        return nil
    }
}
`;

    case 'php':
      return `<?php
// Problem: ${problem.title}
class Solution {
    function ${camel}(...$args) {
        // Write your solution here
        return null;
    }
}
?>
`;

    case 'ruby':
      return `# Problem: ${problem.title}
def ${snake}(*args)
  # Write your solution here
  nil
end
`;

    case 'dart':
      return `class Solution {
  // Problem: ${problem.title}
  dynamic ${camel}(List<dynamic> args) {
    // Write your solution here
    return null;
  }
}
`;

    case 'scala':
      return `object Solution {
    // Problem: ${problem.title}
    def ${camel}(args: Any*): Any = {
        // Write your solution here
        null
    }
}
`;

    case 'r':
      return `# Problem: ${problem.title}
${snake} <- function(...) {
  # Write your solution here
  return(NULL)
}
`;

    case 'sql':
      return `-- Problem: ${problem.title}
-- Write your PostgreSQL query statement below
SELECT *
FROM solutions
WHERE problem_id = '${problem.id}';
`;

    case 'bash':
      return `#!/bin/bash
# Problem: ${problem.title}
# Read from standard input or arguments
echo "Solution for ${problem.title}"
`;

    default:
      return `// Solution for ${problem.title}\nfunction solve() {\n  return 0;\n}`;
  }
}
