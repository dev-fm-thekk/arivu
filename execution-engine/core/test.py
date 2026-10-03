#!/usr/bin/env python3

import sys
import json


def solve(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]

    return []


def main():
    if len(sys.argv) < 3:
        print("Usage: ./test.py <nums> <target>")
        sys.exit(1)

    try:
        # argv[1] = "[1,2,3]"
        nums = json.loads(sys.argv[1])

        # argv[2] = "3"
        target = int(sys.argv[2])

        result = solve(nums, target)

        print(json.dumps({
            "status": "success",
            "output": result
        }))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()