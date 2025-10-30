import { useEffect, useRef, useState } from 'react'
import './ThreatChart.css'

interface ThreatChartProps {
  type: 'threat' | 'cpu' | 'traffic'
}

interface TooltipData {
  x: number
  y: number
  value: string
  time: string
  label?: string
}

function ThreatChart({ type }: ThreatChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const dataRef = useRef<number[][] | number[]>([])
  const chartDimensionsRef = useRef({ width: 0, height: 0, padding: 0, stepX: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 40

    // Generate data points
    const dataPoints = 24
    const data = Array.from({ length: dataPoints }, () => Math.random() * 60 + 20)

    // Store chart dimensions for mouse tracking
    chartDimensionsRef.current = { width, height, padding, stepX: (width - padding * 2) / (dataPoints - 1) }

    if (type === 'cpu') {
      // For CPU chart, generate 3 lines
      const data1 = Array.from({ length: dataPoints }, (_, i) => 
        Math.sin(i * 0.5) * 20 + 50 + Math.random() * 10
      )
      const data2 = Array.from({ length: dataPoints }, (_, i) => 
        Math.cos(i * 0.4) * 15 + 40 + Math.random() * 10
      )
      const data3 = Array.from({ length: dataPoints }, (_, i) => 
        Math.sin(i * 0.3 + 1) * 18 + 45 + Math.random() * 10
      )

      drawCPUChart(ctx, width, height, padding, [data1, data2, data3])
      dataRef.current = [data1, data2, data3]
    } else if (type === 'traffic') {
      // For traffic chart, generate 2 lines (Normal vs Threat)
      const normalTraffic = Array.from({ length: dataPoints }, (_, i) => 
        Math.sin(i * 0.3) * 15 + 60 + Math.random() * 8
      )
      const threatTraffic = Array.from({ length: dataPoints }, (_, i) => 
        Math.sin(i * 0.4 + 2) * 12 + 25 + Math.random() * 6
      )

      drawTrafficChart(ctx, width, height, padding, [normalTraffic, threatTraffic])
      dataRef.current = [normalTraffic, threatTraffic]
    } else {
      // For threat chart, draw area chart
      drawThreatChart(ctx, width, height, padding, data)
      dataRef.current = data
    }

    // Animation
    let animationProgress = 0
    const animate = () => {
      if (animationProgress < 1) {
        animationProgress += 0.02
        ctx.clearRect(0, 0, width, height)
        
        if (type === 'cpu') {
          const data1 = Array.from({ length: dataPoints }, (_, i) => 
            Math.sin(i * 0.5) * 20 + 50 + Math.random() * 2
          )
          const data2 = Array.from({ length: dataPoints }, (_, i) => 
            Math.cos(i * 0.4) * 15 + 40 + Math.random() * 2
          )
          const data3 = Array.from({ length: dataPoints }, (_, i) => 
            Math.sin(i * 0.3 + 1) * 18 + 45 + Math.random() * 2
          )
          drawCPUChart(ctx, width, height, padding, [data1, data2, data3], animationProgress)
        } else if (type === 'traffic') {
          const normalTraffic = Array.from({ length: dataPoints }, (_, i) => 
            Math.sin(i * 0.3) * 15 + 60 + Math.random() * 2
          )
          const threatTraffic = Array.from({ length: dataPoints }, (_, i) => 
            Math.sin(i * 0.4 + 2) * 12 + 25 + Math.random() * 2
          )
          drawTrafficChart(ctx, width, height, padding, [normalTraffic, threatTraffic], animationProgress)
        } else {
          drawThreatChart(ctx, width, height, padding, data, animationProgress)
        }
        
        requestAnimationFrame(animate)
      }
    }
    animate()

    // Mouse move handler for tooltip
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const { width, height, padding, stepX } = chartDimensionsRef.current
      const data = dataRef.current

      // Check if mouse is within chart area
      if (mouseX < padding || mouseX > width - padding || mouseY < padding || mouseY > height - padding) {
        setTooltip(null)
        return
      }

      // Find closest data point
      const dataIndex = Math.round((mouseX - padding) / stepX)
      
      if (type === 'threat' && Array.isArray(data) && !Array.isArray(data[0])) {
        const value = (data as number[])[dataIndex]
        if (value !== undefined) {
          setTooltip({
            x: mouseX,
            y: mouseY,
            value: `${Math.round(value)} threats`,
            time: `${dataIndex}h ago`
          })
        }
      } else if (type === 'cpu' && Array.isArray(data) && Array.isArray(data[0])) {
        const datasets = data as number[][]
        const labels = ['Core 1', 'Core 2', 'Core 3']
        const values = datasets.map((d, i) => `${labels[i]}: ${Math.round(d[dataIndex])}%`).join('\n')
        setTooltip({
          x: mouseX,
          y: mouseY,
          value: values,
          time: `${dataIndex}h ago`
        })
      } else if (type === 'traffic' && Array.isArray(data) && Array.isArray(data[0])) {
        const datasets = data as number[][]
        const labels = ['Normal', 'Threat']
        const values = datasets.map((d, i) => `${labels[i]}: ${Math.round(d[dataIndex])}%`).join('\n')
        setTooltip({
          x: mouseX,
          y: mouseY,
          value: values,
          time: `${dataIndex}h ago`
        })
      }
    }

    const handleMouseLeave = () => {
      setTooltip(null)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }

  }, [type])

  const drawThreatChart = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: number,
    data: number[],
    progress: number = 1
  ) => {
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    const stepX = chartWidth / (data.length - 1)
    const maxValue = Math.max(...data)

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw area
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    
    for (let i = 0; i < data.length * progress; i++) {
      const x = padding + stepX * i
      const y = height - padding - (data[i] / maxValue) * chartHeight
      if (i === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.lineTo(padding + stepX * (data.length - 1) * progress, height - padding)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, 'rgba(255, 68, 68, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 68, 68, 0.0)')
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    for (let i = 0; i < data.length * progress; i++) {
      const x = padding + stepX * i
      const y = height - padding - (data[i] / maxValue) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw x-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < 6; i++) {
      const x = padding + (chartWidth / 5) * i
      ctx.fillText(`${i * 4}h`, x, height - padding + 20)
    }
  }

  const drawCPUChart = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: number,
    datasets: number[][],
    progress: number = 1
  ) => {
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    const stepX = chartWidth / (datasets[0].length - 1)
    const maxValue = 100

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    const colors = ['#00d4ff', '#4AF2C5', '#ffaa00']

    datasets.forEach((data, index) => {
      // Draw line
      ctx.beginPath()
      for (let i = 0; i < data.length * progress; i++) {
        const x = padding + stepX * i
        const y = height - padding - (data[i] / maxValue) * chartHeight
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw x-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < 6; i++) {
      const x = padding + (chartWidth / 5) * i
      ctx.fillText(`${i * 4}h`, x, height - padding + 20)
    }
  }

  const drawTrafficChart = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: number,
    datasets: number[][],
    progress: number = 1
  ) => {
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    const stepX = chartWidth / (datasets[0].length - 1)
    const maxValue = 100

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    const colors = ['#4AF2C5', '#ff4444'] // Green for Normal, Red for Threat
    const labels = ['Normal', 'Threat']

    datasets.forEach((data, index) => {
      // Draw line
      ctx.beginPath()
      for (let i = 0; i < data.length * progress; i++) {
        const x = padding + stepX * i
        const y = height - padding - (data[i] / maxValue) * chartHeight
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 2.5
      ctx.stroke()
    })

    // Draw legend
    const legendX = width - padding - 100
    const legendY = padding + 10
    datasets.forEach((_, index) => {
      // Legend line
      ctx.beginPath()
      ctx.moveTo(legendX, legendY + index * 20)
      ctx.lineTo(legendX + 20, legendY + index * 20)
      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Legend text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(labels[index], legendX + 25, legendY + index * 20 + 4)
    })

    // Draw x-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < 6; i++) {
      const x = padding + (chartWidth / 5) * i
      ctx.fillText(`${i * 4}h`, x, height - padding + 20)
    }
  }

  return (
    <div className="threat-chart" ref={containerRef}>
      <canvas ref={canvasRef} />
      {tooltip && (
        <div 
          className="chart-tooltip"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`
          }}
        >
          <div className="tooltip-time">{tooltip.time}</div>
          <div className="tooltip-value">{tooltip.value}</div>
        </div>
      )}
    </div>
  )
}

export default ThreatChart
