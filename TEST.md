# Virtual Stack Machine/Variable declaration

dec - 04 - 2024 ~ Compilers stack machine declaration ~ How can i up date the compilers stack machine declaration

In the [previous article](/everyday/04-21-2022-compilers-how-virtual-stack-machines-executed), we get an overview of how bytecode is executed in a stack machine.

In this article, we continue to dive into the details of a different scenario: **Variable declaration**.

In the simple language that we are designing, there will be 3 types of variable declaration:

1. Variable with a constant value
2. Variable with a value from other variables
3. Variable with a value from an expression
   [label](https://medium.com/middle-pause/ii-gmy-husband-thought-i-was-interrupting-252896c31f78?source%3Dhome---------0------------------0----------)
   In the following program, we have all 3 declaration types above:

```go
var x = 10      // type 1
var y = x       // type 2
var z = 15 + x  // type 3
```

Let's take a closer look at each case to see how would the bytecode compiler compiles them.

## Inside the stack machine

Aside from the data stack, a stack machine needs to store other information that will be used for the execution, different implementations have different ways to store them, but generally, we can think of them as the 3 tables:

1. **Constants**: to store the literal values in the program, for example, numbers or strings.
2. **Symbols**: to store the variable names that are defined in the program.
3. **Locals**: to map the symbols with their actual values.

To work with these tables, the instruction set usually contains these opcodes (these names are inspired by CPython's opcodes):

- `LOAD_CONST`: Load a value from the **Constants** table, and put it on the top of the stack. It's somewhat similar to the `PUSH` instruction that was introduced in the previous article.
- `LOAD_NAME`: Load the referenced value of a symbol in the **Locals** table, and put it on the top of the stack.
- `STORE_NAME`: Store the address of the value on the top of the stack in the **Locals** table, with the key being the address to the symbol name.

Now, we are ready to dive into each variable declaration type.

## Variable with a constant value

This is the case where a new variable is declared with a constant value. During the compilation, the compiler will put the constant `10` into the **Constants** table (for example, at the location `0x01a`), and put the name `x` into the **Symbols** table at the location `0x01b`.

![](_meta/sm-dec-var-with-const.png)

Then, the expression `var x = 10` will be transformed into two instructions. The first one is `LOAD_CONST 0x01a`, which loads the constant at location `0x01a` into the top of the stack, which is the number `10`. Then, the `STORE_NAME 0x01b` instruction map the address of the value on the top of the stack with the symbol located at `0x01b` — which is the symbol `x`.

## Variable with a value from other variables

Another scenario is when we define a new variable, and assign it with the value from another variable. For example, `var y = x`. Same as above, during the compilation, the symbol `y` was also created in the **Symbols** table, at the location `0x02b`.

![](_meta/sm-dec-var-with-var.png)

Two instructions will be generated. The first one, `LOAD_NAME 0x01b`, will look at the **Locals** table, retrieve the referenced value mapped with the symbol at location `0x01b` — which is the value `10` (at location `0x01c` on the stack), put it to the top of the stack. Then, the second instruction, `STORE_NAME 0x02b`, will map the location of the top of the stack with the symbol at `0x02b` and save it to the **Locals**.

## Variable with a value from an expression

Next, consider the case when a variable is declared and assigned to an expression, the expression may or may not contains another variable. For example, `var z = 15 + x`.

![](_meta/sm-dec-var-expression.png)

Remember that, all bytecode is generated in the way we write _Reversed Polish Notation_, the above statement would become **15 x +**. And it would be transformed into a series of instructions as described in the above diagram.

First, the `LOAD_CONST 0x02a` will load the constant at the location `0x02a` into the top of the stack (the value `15`). Next, the `LOAD_NAME 0x01b` instruction load the value of the symbol at `0x01b` from the **Locals** table (the value `10` at the location `0x01c`), put it on the top of the stack. Then, the `ADD` instruction will pop the top two values on the stack, add them together, and push back the result into the stack — the value `25` at the location `0x03c`.

Finally, the `STORE_NAME 0x03b` instruction saves the location of the top of the stack into the **Locals** table, with the name of the symbol at `0x03b`.

---

In the above examples, we see that when a variable is created, the assigned values are copied from other variables. In reality, we may need to create a pointer that referenced some other memory location. This is a much more complex case that requires us to handle many different aspects of the language, so it will be a topic for another article.

# How Virtual Stack Machines Executed

Different programming languages have different approaches to executing their code. Some languages execute the code as they travel the _AST_ (Tree Walk approach), and some languages compile the code into _bytecode_ and use a _Virtual Machine_ to execute them.

There are also different approaches to implementing a virtual machine, the most popular types of the virtual machine today are:

1. **Register-based Virtual Machines**: which uses a set of registers to store variables, calculation results,... The Lua VM and Android's Dalvik VM are register-based machines.
2. **Stack-based Virtual Machine**: which uses a stack for that purpose, there are some well-known languages that use stack machines, like .NET CLR, WASM runtime VM, Ethereum VM, Java JVM (it is, in fact, both stack-based and register-based)...

It is commonly known that register-based machines are faster than stack-based machines, but implementing them right is a complex task. And implementing a stack-based machine is much easier.

A stack machine is a type of virtual machine that uses a stack to execute code. For all the operations, the operands will pop out from the stack, and the calculation result will be pushed back to the stack, so it can be used as an operand for subsequence instructions.

## A simple expression

For a stack machine to execute, the compiler first needs to compile the code written by the programmer into bytecode. For example, an expression **5 + 10** written in a high-level programming language, would be compiled into a list of imaginary bytecodes as follow:

![](_meta/stack-machine-example-01.png)

The way the bytecode is generated is the same as the way we rewrite the expression in [Reversed Polish Notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation), it becomes **5 10 +**. Then, for each value, it will be pushed to the stack with the **PUSH** instruction. The **ADD** instruction will pop out the last two numbers from the stack, add them together and push back the result into the stack:

![](_meta/stack-machine-example-02-execute.png)

Most instructions in a stack-based machine will treat the data stack in the same way as the **ADD** instruction.

## Conditional branching

There is another type of instruction that can be seen in every program is conditional branching, for example, the **if** statement. It usually contains a condition expression, followed by two execution branches: the _then branch_ and the _else branch_.

![](_meta/stack-machine-if-condition.png)

In this example, the condition expression is a comparison statement, it can be checked by some imaginary **CMP** instruction, that checks the top two values in the stack and pushes back either the value 1 if the two values are equals or 0 if they are not.

The interesting thing happens right after this comparison, the bytecode compiler usually laid out the code for the two execution branches one after each other, with the _then branch_ coming first, and _else branch_ later. To skip the _then branch_, an instruction like **JMP_IF_FALSE** will be used.

The **JMP** instruction on line 7 in the above example is added to drive the execution out of the **if** block after the _then branch_ finished. Without this jump, the machine would continue to execute the _else branch_ right after it finished the _then branch_.

## Function calls

Another important type of execution is function calls. Since in reality, there are much more complex things that the compiler needs to handle when compiling a program with function calls into bytecode (like handling the frame, the default values of a function,...), we will not go into that much of details in this article.

In its most simple form, function calls are just the **JMP** instruction that let you jump around the instruction list, any parameters passed to a function are pushed to the stack before the jump.

![](_meta/stack-machine-function-calls.png)

After the execution, all the return values will be pushed to the stack again, and there is also a **JMP** instruction to put us back to where we were before the function call.

---

That's pretty much it for today. In the next few articles, we will design and implement a simple stack machine with some imaginary instruction set, just enough to execute some simple programs.

**References:**

- https://www.cp.eng.chula.ac.th/~prabhas//teaching/ca/stack.htm
- https://users.ece.cmu.edu/~koopman/stack_computers/sec3_2.html
- https://www.craftinginterpreters.com/calls-and-functions.html (Great book!)
- https://www.epfl.ch/labs/lamp/wp-content/uploads/2019/01/acc14_08_interpreters-vms.pdf
