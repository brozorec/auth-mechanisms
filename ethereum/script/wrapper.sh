forge script script/Wrapper.s.sol:WrapperScript --fork-url http://localhost:8545 --broadcast | awk '/0x/ {hash=$1} END {print hash}' | xargs cast tx --json > script/wrapper-tx-output.json
