#!/usr/bin/env python3

from greshunkel.build import main
from greshunkel.context import build_review_context, BASE_CONTEXT

if __name__ == '__main__':
    bc = build_review_context(BASE_CONTEXT)
    main(bc)
