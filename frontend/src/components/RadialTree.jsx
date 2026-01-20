import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export function RadialTree({ data, width = 928, height = 928 }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Create the radial tree layout
    const radius = Math.min(width, height) / 2
    const tree = d3.tree()
      .size([2 * Math.PI, radius - 100])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

    // Create hierarchy from data
    const root = d3.hierarchy(data)
    tree(root)

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;')

    // Add links
    svg.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll()
      .data(root.links())
      .join('path')
      .attr('d', d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y))

    // Add nodes
    const node = svg.append('g')
      .selectAll()
      .data(root.descendants())
      .join('g')
      .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)

    node.append('circle')
      .attr('fill', d => d.children ? '#555' : '#999')
      .attr('r', 2.5)

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
      .text(d => d.data.name)
      .clone(true).lower()
      .attr('stroke', 'white')
      .attr('stroke-width', 3)

  }, [data, width, height])

  return <svg ref={svgRef}></svg>
}
