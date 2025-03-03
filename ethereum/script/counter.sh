forge script script/Counter.s.sol:CounterScript --fork-url http://localhost:8545 --broadcast | awk '/0x/ {hash=$1} END {print hash}' | xargs cast tx --json > script/counter-tx-output.json
