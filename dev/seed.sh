flow accounts add-contract HelloWorld contracts/HelloWorld.cdc

count="${1:-4}" # defaults to 4 transactions

for ((n=0;n<count;n++))
do
  flow transactions send transactions/HelloWorld.cdc HelloWorld
done
