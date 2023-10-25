module.exports = grammar({
    name: 'razor',

    //extras - an array of tokens that may appear anywhere in the language.
    //This is often used for whitespace and comments. The default value of
    //extras is to accept whitespace. To control whitespace explicitly, specify
    //extras: $ => [] in your grammar
    extras: $ => [
        //Space
        /\s/
    ],

    //Here we define the rules. The order of definition is important here.
    //The higher the rule is in the order of declaration the more relevant
    //it is.
    rules: {

        //repeat() matches zero or more occurences. Thus also matching an empty file.
        //The matching of empty can only happen in the "root" rule.
        document: $ => repeat($._markup),

        _markup: $ => choice(
            $.route_declaration,
            $.element,
            //prec.left($.tag),
            prec.right($.start_tag),
            $.end_tag,
            $.attribute,
            $.word,
            $.non_word,

            $.interpolated_expression,
            $.interpolated_if_statement,
            $.interpolated_while_statement,
            $.interpolated_code_block
            // other interpolated control flow statements ...
        ),

        route_declaration: $ => seq("@page",$.route),

        //matches any sequence of characters that does not contain a double-quote
        route: $ => token(seq(
            '"',
            /[^"]*/,
            '"'
        )),

        //A tag is an XML tag. This may contain another tag completelly.
        element: $ => seq($.start_tag, $._markup, $.end_tag),

        attribute: $ => seq($.word,'=',$.string),
        start_tag: $ => seq('<', $.tag_name, optional($.attribute), '>'),
        end_tag: $ => seq('</', $.tag_name, '>'),


        _code: $ => choice(
            $._statement,
            $.element
        ),

        interpolated_expression: $ => seq('@', choice(
            $._simple_expression,
            seq('(', $._expression, ')')
        )),

        interpolated_if_statement: $ => seq(
            '@if', '(', $._expression, ')',
            '{', $._code, '}'
        ),

        interpolated_while_statement: $ => seq(
            '@while', '(', $._expression, ')',
            '{', $._code, '}'
        ),

        interpolated_code_block: $ => seq('@{', $._code, '}'),

        _expression: $ => choice(
            $.identifier,
            $.number,
            $.string,
            $.binary_expression,
            $.call_expression,
            $.member_expression
            // other types of expressions ...
        ),

        _simple_expression: $ => choice(
            $.simple_member_expression,
            $.simple_call_expression,
            $.identifier
        ),

        _statement: $ => choice(
            $.variable_declaration,
            $.expression_statement
            // other statements ...
        ),

        variable_declaration: $ => seq(
            $.type_specifier,
            $.identifier,
            optional(seq(
                '=',
                $._expression
            )),
            ';'
        ),

        type_specifier: $ => choice('var', $.identifier),

        expression_statement: $ => seq($._expression, ';'),

        binary_expression: $ => choice(
            prec.left(seq($._expression, '+', $._expression)),
            prec.left(seq($._expression, '-', $._expression))
            // other binary expressions ...
        ),

        call_expression: $ => seq($._expression, '(', commaSep($._expression), ')'),
        simple_call_expression: $ => seq($._simple_expression, '(', commaSep($._expression), ')'),

        member_expression: $ => seq($._expression, '.', $.identifier),
        simple_member_expression: $ => seq($._simple_expression, '.', $.identifier),


        string: $ => token(seq(
            '"',
            /[^"]*/,
            '"'
        )),

        //Any number of letters and numbers
        //identifier: $ => (/\a[\a\d]*/),
        identifier: $ => (/[a-zA-Z0-9_-]*/),

        //Look for one or more characters
        tag_name: $ => (/[a-zA-Z0-9_-]+/),

        //Look for one or more characters. Matches a single word
        word: $ => (/[a-zA-Z]+/),

        //Look for one or more digits
        number: $ => (/\d+/),

        non_word: $ => (/[^\a]/)
    }
});

function commaSep (rule) {
    return optional(seq(rule, repeat(seq(',', rule))));
}
