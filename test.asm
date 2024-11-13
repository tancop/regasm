[data]

# komentar 1
magic_number: 42

counter: 1024 # = 0
const_funny: 1025 # = 69
output_addr: 1026 # = 1027

[code]

main:
# zistime ci sme zapisali 42 krat %const_funny
load [%counter]
cmp %magic_number
jc %exit
inc
store [%counter]

load [%const_funny]
store [mem %output_addr]

load [%output_addr]
inc
store [%output_addr]
jmp %main # vratime sa na zaciatok cyklu

exit: halt