module.exports = [
  {
    context: [
      "/api/**/*",
      "/auth/**/*"
    ],
    target: "http://localhost:9000",
    secure: false
  }
]
