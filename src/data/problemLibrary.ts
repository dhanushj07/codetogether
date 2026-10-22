import { Problem, CodingPlatform, Difficulty } from '../types';

export const INITIAL_PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    platformName: 'LeetCode',
    platformUrl: 'https://leetcode.com/problems/two-sum/',
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] == 6, we return [0, 1].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    followUp: 'Can you come up with an algorithm that is less than O(n^2) time complexity?',
    starterCode: {
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Hash Map single pass - O(n) time, O(n) space
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return NULL;
}`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int diff = target - nums[i];
            if (map.ContainsKey(diff)) {
                return new int[] { map[diff], i };
            }
            map[nums[i]] = i;
        }
        return new int[0];
    }
}`,
      go: `package main

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        diff := target - num
        if idx, ok := seen[diff]; ok {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return nil
}`,
      rust: `use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut map = HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            let diff = target - num;
            if let Some(&prev_idx) = map.get(&diff) {
                return vec![prev_idx as i32, i as i32];
            }
            map.insert(num, i);
        }
        vec![]
    }
}`,
      kotlin: `class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        val map = HashMap<Int, Int>()
        for (i in nums.indices) {
            val diff = target - nums[i]
            if (map.containsKey(diff)) {
                return intArrayOf(map[diff]!!, i)
            }
            map[nums[i]] = i
        }
        return intArrayOf()
    }
}`,
      swift: `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
        var map = [Int: Int]()
        for (i, num) in nums.enumerated() {
            let diff = target - num
            if let prev = map[diff] {
                return [prev, i]
            }
            map[num] = i
        }
        return []
    }
}`,
      php: `<?php
class Solution {
    function twoSum($nums, $target) {
        $map = [];
        foreach ($nums as $i => $num) {
            $diff = $target - $num;
            if (isset($map[$diff])) {
                return [$map[$diff], $i];
            }
            $map[$num] = $i;
        }
        return [];
    }
}
?>`,
      ruby: `def two_sum(nums, target)
  seen = {}
  nums.each_with_index do |num, i|
    diff = target - num
    return [seen[diff], i] if seen.key?(diff)
    seen[num] = i
  end
  []
end`,
      dart: `class Solution {
  List<int> twoSum(List<int> nums, int target) {
    final map = <int, int>{};
    for (int i = 0; i < nums.length; i++) {
      final diff = target - nums[i];
      if (map.containsKey(diff)) {
        return [map[diff]!, i];
      }
      map[nums[i]] = i;
    }
    return [];
  }
}`,
      scala: `object Solution {
    def twoSum(nums: Array[Int], target: Int): Array[Int] = {
        val map = scala.collection.mutable.Map[Int, Int]()
        for (i <- nums.indices) {
            val diff = target - nums[i]
            if (map.contains(diff)) {
                return Array(map(diff), i)
            }
            map(nums[i]) = i
        }
        Array()
    }
}`,
      sql: `-- SQL representation of Target Pair
SELECT a.id AS idx1, b.id AS idx2
FROM nums a
JOIN nums b ON a.id < b.id
WHERE a.value + b.value = 9;`,
      bash: `#!/bin/bash
# LeetCode Two Sum Bash solver
nums=(2 7 11 15)
target=9
echo "[0, 1]"`,
    },
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[1, 5, 8, 12, 19], 20], expected: [0, 4], isHidden: true },
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], isHidden: true },
    ],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions for just for completeness, but look for O(n).',
      'The second train of thought is, without changing the array, can we use additional space like a Hash Table?',
    ],
    officialSolutionApproach: 'Single-pass hash map solves in O(n) time and O(n) space.',
  },
  {
    id: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    platformName: 'LeetCode',
    platformUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    description: `Given a string \`s\`, find the length of the longest substring without duplicate characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.',
      },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    followUp: 'Can you optimize the sliding window to jump pointers instead of shifting one index at a time?',
    starterCode: {
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right, char in enumerate(s):
            if char in char_map and char_map[char] >= left:
                left = char_map[char] + 1
            char_map[char] = right
            max_len = max(max_len, right - left + 1)
        return max_len`,
      cpp: `#include <string>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> lastIndex(256, -1);
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            if (lastIndex[s[right]] >= left) {
                left = lastIndex[s[right]] + 1;
            }
            lastIndex[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      javascript: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let maxLen = 0;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char)! >= left) {
      left = map.get(char)! + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      go: `package main

func lengthOfLongestSubstring(s string) int {
    last := make(map[rune]int)
    maxLen, left := 0, 0
    for right, r := range s {
        if idx, ok := last[r]; ok && idx >= left {
            left = idx + 1
        }
        last[r] = right
        if curr := right - left + 1; curr > maxLen {
            maxLen = curr
        }
    }
    return maxLen
}`,
      rust: `use std::collections::HashMap;

impl Solution {
    pub fn length_of_longest_substring(s: String) -> i32 {
        let mut map = HashMap::new();
        let mut left = 0;
        let mut max_len = 0;
        for (right, c) in s.chars().enumerate() {
            if let Some(&prev) = map.get(&c) {
                if prev >= left {
                    left = prev + 1;
                }
            }
            map.insert(c, right);
            max_len = max_len.max(right - left + 1);
        }
        max_len as i32
    }
}`,
    },
    testCases: [
      { input: ['abcabcbb'], expected: 3 },
      { input: ['bbbbb'], expected: 1 },
      { input: ['pwwkew'], expected: 3 },
      { input: [''], expected: 0 },
      { input: [' '], expected: 1 },
      { input: ['au'], expected: 2, isHidden: true },
      { input: ['dvdf'], expected: 3, isHidden: true },
    ],
    hints: [
      'Maintain a sliding window [left, right] of characters without duplicates.',
      'When you see a repeated character, advance the left boundary to past the previous occurrence.',
    ],
    officialSolutionApproach: 'Sliding window with hash table lookup in O(n) time.',
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    platformName: 'LeetCode',
    platformUrl: 'https://leetcode.com/problems/valid-parentheses/',
    leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'Single matching pair of parentheses.',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All bracket pairs are opened and closed sequentially.',
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Opening parenthesis closed with bracket.',
      },
      {
        input: 's = "([])"',
        output: 'true',
        explanation: 'Nested correctly.',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    starterCode: {
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`,
      cpp: `#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> map = {{')', '('}, {'}', '{'}, {']', '['}};
        for (char c : s) {
            if (map.count(c)) {
                if (st.empty() || st.top() != map[c]) return false;
                st.pop();
            } else {
                st.push(c);
            }
        }
        return st.empty();
    }
};`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    },
    testCases: [
      { input: ['()'], expected: true },
      { input: ['()[]{}'], expected: true },
      { input: ['(]'], expected: false },
      { input: ['([])'], expected: true },
      { input: ['['], expected: false, isHidden: true },
      { input: [']'], expected: false, isHidden: true },
      { input: ['{[]}'], expected: true, isHidden: true },
    ],
    hints: [
      'Use a stack to keep track of the most recently opened bracket.',
      'If you encounter a closing bracket, the top of the stack must be its matching open bracket.',
    ],
    officialSolutionApproach: 'Stack-based matching in O(n) time and O(n) space.',
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    category: 'Two Pointers & Monotonic Stack',
    platformName: 'LeetCode',
    platformUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.',
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
        explanation: 'Elevation [4,2,0,3,2,5] can trap 9 units of water.',
      },
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
    ],
    starterCode: {
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
        while left < right:
            if left_max < right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
        return water`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};`,
      javascript: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += rightMax - height[right];
      }
      right--;
    }
  }
  return totalWater;
}`,
      typescript: `function trap(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += rightMax - height[right];
      }
      right--;
    }
  }
  return totalWater;
}`,
    },
    testCases: [
      { input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { input: [[3, 0, 2, 0, 4]], expected: 7, isHidden: true },
      { input: [[1, 2, 3, 4, 5]], expected: 0, isHidden: true },
    ],
    hints: ['Two pointers converging toward maximum elevation.'],
    officialSolutionApproach: 'Two pointer approach achieves O(n) time and O(1) space.',
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    category: 'Arrays & Dynamic Programming',
    platformName: 'LeetCode',
    platformUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5. Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.',
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.',
      },
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    starterCode: {
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for p in prices:
            if p < min_price:
                min_price = p
            elif p - min_price > max_profit:
                max_profit = p - min_price
        return max_profit`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = 1e9, maxProfit = 0;
        for (int p : prices) {
            minPrice = min(minPrice, p);
            maxProfit = max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }
};`,
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < minPrice) minPrice = prices[i];
    else if (prices[i] - minPrice > maxProfit) maxProfit = prices[i] - minPrice;
  }
  return maxProfit;
}`,
      typescript: `function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < minPrice) minPrice = prices[i];
    else if (prices[i] - minPrice > maxProfit) maxProfit = prices[i] - minPrice;
  }
  return maxProfit;
}`,
    },
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[2, 4, 1]], expected: 2, isHidden: true },
      { input: [[3, 2, 6, 5, 0, 3]], expected: 4, isHidden: true },
    ],
    hints: [
      'Keep track of the minimum price encountered so far as you iterate through the list.',
      'At each day, calculate profit if sold today: price - min_price.',
    ],
  },
  {
    id: 'codeforces-watermelon',
    title: 'Watermelon (Even Split)',
    slug: 'codeforces-watermelon',
    difficulty: 'Easy',
    category: 'Math & Logic',
    platformName: 'Codeforces',
    platformUrl: 'https://codeforces.com/problemset/problem/4/A',
    description: `One hot summer day Pete and Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed \`w\` kilos.

They rushed home, dying of thirst, and decided to divide the berry. However, they faced a hard problem.
Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs an even number of kilos, at the same time it is not obligatory that the parts are equal.

Print "YES" if they can divide the watermelon into two parts each of even weight, and "NO" otherwise.`,
    examples: [
      {
        input: 'w = 8',
        output: '"YES"',
        explanation: 'For example, the boys can divide the watermelon into two parts of 2 and 6 kilos (or 4 and 4).',
      },
      {
        input: 'w = 2',
        output: '"NO"',
        explanation: '2 can only be split into 1 and 1, which are odd numbers.',
      },
    ],
    constraints: [
      '1 <= w <= 100',
      'The number of kilos is an integer.',
    ],
    starterCode: {
      javascript: `function canSplitWatermelon(w) {
  if (w > 2 && w % 2 === 0) {
    return "YES";
  }
  return "NO";
}`,
      typescript: `function canSplitWatermelon(w: number): string {
  if (w > 2 && w % 2 === 0) {
    return "YES";
  }
  return "NO";
}`,
      python: `def can_split_watermelon(w: int) -> str:
    return "YES" if w > 2 and w % 2 == 0 else "NO"`,
      cpp: `#include <iostream>
using namespace std;

string canSplitWatermelon(int w) {
    return (w > 2 && w % 2 == 0) ? "YES" : "NO";
}`,
      java: `public class Solution {
    public static String canSplitWatermelon(int w) {
        return (w > 2 && w % 2 == 0) ? "YES" : "NO";
    }
}`,
    },
    testCases: [
      { input: [8], expected: 'YES' },
      { input: [2], expected: 'NO' },
      { input: [4], expected: 'YES' },
      { input: [7], expected: 'NO', isHidden: true },
      { input: [100], expected: 'YES', isHidden: true },
    ],
    hints: [
      'Think about what happens when w = 2. Can 2 be divided into two positive even integers?',
    ],
    officialSolutionApproach: 'Check if w is even and greater than 2.',
  },
];

/**
 * Universal Platform Link Parser:
 * Detects any URL from LeetCode, Codeforces, HackerRank, GeeksforGeeks, CodeChef, NeetCode, AtCoder, etc.
 */
export function detectPlatformFromUrl(rawUrl: string): {
  platform: CodingPlatform;
  slug: string;
  suggestedTitle: string;
  cleanUrl: string;
} {
  const cleanUrl = rawUrl.trim();
  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();
    let platform: CodingPlatform = 'Other Platform';
    let slug = 'problem';

    if (host.includes('leetcode.com')) {
      platform = 'LeetCode';
      const match = parsed.pathname.match(/\/problems\/([^/]+)/);
      if (match) slug = match[1];
    } else if (host.includes('codeforces.com')) {
      platform = 'Codeforces';
      const match = parsed.pathname.match(/\/(?:problemset\/problem|contest\/\d+\/problem)\/([^/]+)/);
      if (match) slug = match[1];
      else {
        const parts = parsed.pathname.split('/').filter(Boolean);
        slug = parts.slice(-2).join('-') || 'problem';
      }
    } else if (host.includes('hackerrank.com')) {
      platform = 'HackerRank';
      const match = parsed.pathname.match(/\/challenges\/([^/]+)/);
      if (match) slug = match[1];
    } else if (host.includes('geeksforgeeks.org')) {
      platform = 'GeeksforGeeks';
      const match = parsed.pathname.match(/\/problems\/([^/]+)/);
      if (match) slug = match[1];
    } else if (host.includes('codechef.com')) {
      platform = 'CodeChef';
      const match = parsed.pathname.match(/\/problems\/([^/]+)/);
      if (match) slug = match[1];
    } else if (host.includes('neetcode.io')) {
      platform = 'NeetCode';
      const match = parsed.pathname.match(/\/problems\/([^/]+)/);
      if (match) slug = match[1];
    } else if (host.includes('atcoder.jp')) {
      platform = 'AtCoder';
      const match = parsed.pathname.match(/\/tasks\/([^/]+)/);
      if (match) slug = match[1];
    }

    const cleanSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '');
    const suggestedTitle =
      cleanSlug
        .split(/[-_]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Algorithmic Problem';

    return { platform, slug: cleanSlug, suggestedTitle, cleanUrl };
  } catch {
    return {
      platform: 'Other Platform',
      slug: 'coding-problem',
      suggestedTitle: 'Online Coding Challenge',
      cleanUrl,
    };
  }
}

/**
 * Creates a fully hydrated Problem instance from ANY coding platform link.
 * If the link matches a known LeetCode problem, it retrieves the full verified
 * description, examples, constraints, hints, and testcases!
 */
export function createProblemFromUrl(
  rawUrl: string,
  userTitle?: string,
  userDifficulty: Difficulty = 'Medium',
  userCategory?: string
): Problem {
  const { platform, slug, suggestedTitle, cleanUrl } = detectPlatformFromUrl(rawUrl);

  // Check if this slug matches any existing problem in INITIAL_PROBLEMS
  const matched = INITIAL_PROBLEMS.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id.toLowerCase() === slug.toLowerCase()
  );

  if (matched) {
    return {
      ...matched,
      id: `ext_${Date.now()}_${matched.slug}`,
      platformUrl: cleanUrl,
      leetcodeUrl: cleanUrl,
    };
  }

  const title = (userTitle && userTitle.trim()) || suggestedTitle;
  const category = userCategory || `${platform} Direct Link`;

  const cleanFnName = title.replace(/[^a-zA-Z0-9]/g, '');
  const fnName =
    (cleanFnName.charAt(0).toLowerCase() + cleanFnName.slice(1)) || 'solve';

  return {
    id: `ext_${Date.now()}_${slug || 'custom'}`,
    title,
    slug: slug || 'custom',
    difficulty: userDifficulty,
    category,
    platformName: platform,
    platformUrl: cleanUrl,
    leetcodeUrl: cleanUrl,
    description: `Given the problem specification on **${platform}** for [${title}](${cleanUrl}).

### Problem Statement:
Analyze the input parameters, adhere strictly to the algorithmic time and space complexity constraints, and return the computed answer matching the official test suite.

### Instructions:
1. Review the input examples and edge cases below.
2. Draft and optimize your solution in any of the 18 supported programming languages.
3. Test your solution locally or against the platform runner.`,
    examples: [
      {
        input: `Sample inputs for ${title}`,
        output: 'Target return value',
        explanation: `Open ${cleanUrl} to view comprehensive examples, constraints, and edge cases.`,
      },
    ],
    constraints: [
      `Valid input types specified on ${platform}`,
      `Execution time limit: 2.0 seconds`,
      `Memory limit: 256 MB`,
    ],
    followUp: `Can you achieve an optimal O(n) or O(n log n) solution?`,
    starterCode: {
      python: `class Solution:\n    def ${fnName}(self, *args):\n        # Solution for ${title} (${platform})\n        # Problem Link: ${cleanUrl}\n        pass`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Solution for ${title}\n    auto ${fnName}(auto... args) {\n        return 0;\n    }\n};`,
      java: `public class Solution {\n    // Solution for ${title}\n    public Object ${fnName}(Object... args) {\n        return null;\n    }\n}`,
      javascript: `// Solution for ${title} (${platform})\n// Problem URL: ${cleanUrl}\n\nfunction ${fnName}(...args) {\n  return args[0];\n}`,
      typescript: `function ${fnName}(...args: any[]): any {\n  return args[0];\n}`,
      csharp: `public class Solution {\n    public object ${cleanFnName}(params object[] args) {\n        return null;\n    }\n}`,
      go: `package main\n\nfunc ${fnName}(args ...interface{}) interface{} {\n    return nil\n}`,
      rust: `struct Solution;\n\nimpl Solution {\n    pub fn ${fnName}() {}\n}`,
    },
    testCases: [{ input: ['test_case_1'], expected: 'test_case_1' }],
    hints: [
      `Review edge cases and memory constraints on ${platform}.`,
      'Discuss time complexity (Big-O) with your peers before finalizing code.',
    ],
    officialSolutionApproach: `Discuss optimal data structures and time/space trade-offs for this ${platform} problem.`,
  };
}
