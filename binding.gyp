{
  "targets": [
    {
      "target_name": "ts_language_razor_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "<!(node -e \"require('tree-sitter-compiler/include_path')\")",
      ],
      "sources": [
        "src/parser.c",
        "bindings/node/binding.cc",
      ],
      "cflags_c": [
        "-std=c99",
      ],
    },
  ],
}
