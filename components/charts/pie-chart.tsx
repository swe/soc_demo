'use client'

import { useRef, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

import { chartColors } from '@/components/charts/chartjs-config'
import {
  Chart, PieController, ArcElement, TimeScale, Tooltip,
} from 'chart.js'
import type { ChartData } from 'chart.js'
import 'chartjs-adapter-moment'

// Import utilities
import { getCssVariable } from '@/components/utils/utils'

Chart.register(PieController, ArcElement, TimeScale, Tooltip)
Chart.overrides.doughnut.cutout = '80%'

interface DoughnutProps {
  data: ChartData
  width: number
  height: number
}

export default function DoughnutChart({
  data,
  width,
  height
}: DoughnutProps) {

  const [chart, setChart] = useState<Chart | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const legend = useRef<HTMLUListElement>(null)
  const { theme } = useTheme()
  const darkMode = theme === 'dark'
  const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors  

  useEffect(() => {    
    const ctx = canvas.current
    if (!ctx) return
    
    // Check if canvas is in DOM
    if (!ctx.ownerDocument || !ctx.ownerDocument.body.contains(ctx)) {
      return
    }
    
    // Validate data before creating chart - must have valid data
    if (!data || !data.labels || !Array.isArray(data.labels) || data.labels.length === 0 ||
        !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
      return
    }
    
    // Ensure data is properly structured
    const chartData = {
      labels: data.labels || [],
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        data: Array.isArray(dataset.data) ? dataset.data : []
      }))
    }
    
    // Double check that we have valid data
    if (!chartData.labels || chartData.labels.length === 0 || 
        !chartData.datasets || chartData.datasets.length === 0) {
      return
    }
    
    let newChart: Chart | null = null
    try {
      newChart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        layout: {
          padding: {
            top: 4,
            bottom: 4,
            left: 24,
            right: 24,
          },
        },
        plugins: {
          legend: {
            display: false,
            labels: {
              generateLabels: (chart) => {
                // Safe generateLabels that handles missing data
                try {
                  if (!chart || !chart.data) {
                    return []
                  }
                  const chartData = chart.data as any
                  if (!chartData.labels || !Array.isArray(chartData.labels) || 
                      !chartData.datasets || !Array.isArray(chartData.datasets) || 
                      chartData.datasets.length === 0) {
                    return []
                  }
                  // Use default generateLabels if data exists
                  const defaultGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels
                  if (defaultGenerateLabels && typeof defaultGenerateLabels === 'function') {
                    return defaultGenerateLabels(chart) || []
                  }
                  return []
                } catch (e) {
                  console.warn('Error in generateLabels:', e)
                  return []
                }
              }
            }
          },
          tooltip: {
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },          
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        animation: {
          duration: 200,
        },
        maintainAspectRatio: false,
        responsive: false,
      },
      plugins: [
        {
          id: 'htmlLegend',
          afterUpdate(c, args, options) {
            const ul = legend.current
            if (!ul) return
            
            // Check if canvas is still in DOM
            const canvas = c.canvas
            if (!canvas || !canvas.ownerDocument || !canvas.ownerDocument.body.contains(canvas)) {
              return
            }
            
            // Check if data exists
            if (!c.data || !c.data.labels || !c.data.datasets || c.data.datasets.length === 0) {
              // Clear legend if no data
              while (ul.firstChild) {
                ul.firstChild.remove()
              }
              return
            }
            // Remove old legend items
            while (ul.firstChild) {
              ul.firstChild.remove()
            }
            // Safely get legend items
            let items: any[] = []
            try {
              const generateLabels = c.options.plugins?.legend?.labels?.generateLabels
              if (generateLabels) {
                items = generateLabels(c) || []
              }
            } catch (e) {
              console.warn('Error generating legend labels:', e)
              return
            }
            if (!items || items.length === 0) return
            items.forEach((item) => {
              const li = document.createElement('li')
              li.style.margin = '6px'
              // Button element
              const button = document.createElement('button')
              button.style.display = 'inline-flex'
              button.style.alignItems = 'center'
              button.style.opacity = item.hidden ? '.3' : ''
              button.onclick = () => {
                c.toggleDataVisibility(item.index!)
                c.update()
              }
              // Color box
              const box = document.createElement('span')
              box.style.display = 'block'
              box.style.width = '12px'
              box.style.height = '12px'
              box.style.borderRadius = 'calc(infinity * 1px)'
              box.style.marginRight = '6px'
              box.style.borderWidth = '3px'
              box.style.borderColor = item.fillStyle as string
              box.style.pointerEvents = 'none'
              // Label
              const label = document.createElement('span')
              label.classList.add('text-gray-500', 'dark:text-gray-400')
              label.style.fontSize = '14px'
              label.style.lineHeight = 'calc(1.25 / 0.875)'
              const labelText = document.createTextNode(item.text)
              label.appendChild(labelText)
              li.appendChild(button)
              button.appendChild(box)
              button.appendChild(label)
              ul.appendChild(li)
            })
          },
        },
      ],
    })
    } catch (e) {
      console.warn('Error creating chart:', e)
      return
    }
    
    if (!newChart) return
    
    setChart(newChart)
    return () => {
      if (newChart) {
        try {
          newChart.destroy()
        } catch (e) {
          console.warn('Error destroying chart:', e)
        }
      }
    }
  }, [data])

  // Update chart data when it changes
  useEffect(() => {
    if (!chart || !data || !data.labels || !data.datasets || data.datasets.length === 0) return
    
    // Check if canvas is still in DOM
    const ctx = canvas.current
    if (!ctx || !ctx.ownerDocument || !ctx.ownerDocument.body.contains(ctx)) {
      return
    }
    
    try {
      chart.data = data
      chart.update('none')
    } catch (e) {
      console.warn('Error updating chart data:', e)
    }
  }, [chart, data])

  // Update theme colors
  useEffect(() => {
    if (!chart) return

    // Check if canvas is still in DOM
    const ctx = canvas.current
    if (!ctx || !ctx.ownerDocument || !ctx.ownerDocument.body.contains(ctx)) {
      return
    }

    try {
      if (darkMode) {
        chart.options.plugins!.tooltip!.titleColor = tooltipTitleColor.dark
        chart.options.plugins!.tooltip!.bodyColor = tooltipBodyColor.dark
        chart.options.plugins!.tooltip!.backgroundColor = tooltipBgColor.dark
        chart.options.plugins!.tooltip!.borderColor = tooltipBorderColor.dark
      } else {
        chart.options.plugins!.tooltip!.titleColor = tooltipTitleColor.light
        chart.options.plugins!.tooltip!.bodyColor = tooltipBodyColor.light
        chart.options.plugins!.tooltip!.backgroundColor = tooltipBgColor.light
        chart.options.plugins!.tooltip!.borderColor = tooltipBorderColor.light
      }
      chart.update('none')
    } catch (e) {
      console.warn('Error updating chart theme:', e)
    }
  }, [chart, theme, darkMode, tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor])    

  return (
    <div className="grow flex flex-col justify-center">
      <div>
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
      <div className="px-5 py-4">
        <ul ref={legend} className="flex flex-wrap justify-center -m-1" />
      </div>
    </div>
  )
}