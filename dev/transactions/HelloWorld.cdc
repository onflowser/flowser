import HelloWorld from 0xf8d6e0586b0a20c7

transaction {

  prepare(acct: AuthAccount) {}

  execute {
    log(HelloWorld.hello())
  }
}
