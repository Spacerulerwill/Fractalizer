package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type shaderSource struct {
	VertexSource   string `json:"vertexSource"`
	FragmentSource string `json:"fragmentSource"`
}

func LoadShaderSource(shader string) shaderSource {
	vertexShaderBytes, err := os.ReadFile(fmt.Sprintf("shaders/%s.vrx", shader))
	if err != nil {
		log.Panic(err)
	}
	vertexShaderSource := string(vertexShaderBytes)

	fragmentShaderBytes, err := os.ReadFile(fmt.Sprintf("shaders/%s.frg", shader))
	if err != nil {
		fmt.Print(err)
	}
	fragmentShaderSource := string(fragmentShaderBytes)

	return shaderSource{
		VertexSource:   vertexShaderSource,
		FragmentSource: fragmentShaderSource,
	}
}

func main() {
	mandelbrotShader := LoadShaderSource("mandelbrot")

	r := gin.Default()
	r.Static("/public", "./public")
	r.LoadHTMLGlob("public/*")
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
	r.GET("/mandelbrot", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, mandelbrotShader)
	})
	r.Run(":3000")
}
