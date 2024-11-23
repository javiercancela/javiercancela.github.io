
Installing PyTorch in PyCharm with Poetry, I get this error:

```
(ldl-py3.12) javier.cancela@AuroraMacPro LDL % poetry add torch
Using version ^2.2.1 for torch

Updating dependencies
Resolving dependencies... (17.1s)

Writing lock file

Package operations: 9 installs, 0 updates, 0 removals

  • Installing markupsafe (2.1.5): Installing...
  • Installing mpmath (1.3.0): Failed

  CalledProcessError

  Command '['/Users/javier.cancela/Library/Caches/pypoetry/virtualenvs/ldl-0TYnS2Tm-py3.12/bin/python', '-m', 'pip', 'install', '--disable-pip-version-check', '--isolated', '--no-input', '--prefix', '/Users/javier.cancela/Library/Caches/pypoetry/virtualenvs/ldl-0TYnS2Tm-py3.12', '--no-deps', '/Users/javier.cancela/Library/Caches/pypoetry/artifacts/7b/2f/79/86a61e7cda070bdb0b60ef14d0345a0206d4b8dd26714cb45fa72b09d4/mpmath-1.3.0-py3-none-any.whl']' returned non-zero exit status 2.

```

I moved to pip with a venv and all worked.
