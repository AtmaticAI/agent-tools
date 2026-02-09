import { structural } from '@agent-tools/core';

export const structuralTools = [
  // --- Stress & Strain ---
  {
    name: 'agent_tools_structural_normal_stress',
    description: 'Calculate normal stress (σ = F/A) given force and cross-sectional area.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        force: { type: 'number', description: 'Axial force in Newtons' },
        area: { type: 'number', description: 'Cross-sectional area in m²' },
      },
      required: ['force', 'area'],
    },
    handler: async (args: { force: number; area: number }) => {
      try {
        const result = structural.normalStress(args.force, args.area);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_shear_stress',
    description: 'Calculate shear stress (τ = V/A) given shear force and area.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        force: { type: 'number', description: 'Shear force in Newtons' },
        area: { type: 'number', description: 'Cross-sectional area in m²' },
      },
      required: ['force', 'area'],
    },
    handler: async (args: { force: number; area: number }) => {
      try {
        const result = structural.shearStress(args.force, args.area);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_strain',
    description: 'Calculate strain (ε = ΔL/L) given change in length and original length.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deltaLength: { type: 'number', description: 'Change in length in meters' },
        originalLength: { type: 'number', description: 'Original length in meters' },
      },
      required: ['deltaLength', 'originalLength'],
    },
    handler: async (args: { deltaLength: number; originalLength: number }) => {
      try {
        const result = structural.strain(args.deltaLength, args.originalLength);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_youngs_modulus',
    description: "Calculate Young's modulus (E = σ/ε) from stress and strain values.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        stress: { type: 'number', description: 'Stress in Pa' },
        strain: { type: 'number', description: 'Strain (dimensionless)' },
      },
      required: ['stress', 'strain'],
    },
    handler: async (args: { stress: number; strain: number }) => {
      try {
        const result = structural.youngsModulus(args.stress, args.strain);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_factor_of_safety',
    description: 'Calculate factor of safety (FoS = σ_ultimate / σ_working).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ultimateStress: { type: 'number', description: 'Ultimate stress in Pa' },
        workingStress: { type: 'number', description: 'Working/allowable stress in Pa' },
      },
      required: ['ultimateStress', 'workingStress'],
    },
    handler: async (args: { ultimateStress: number; workingStress: number }) => {
      try {
        const result = structural.factorOfSafety(args.ultimateStress, args.workingStress);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_hoop_stress',
    description: 'Calculate hoop and longitudinal stress in thin-walled pressure vessels (σ = pR/t).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pressure: { type: 'number', description: 'Internal pressure in Pa' },
        radius: { type: 'number', description: 'Vessel radius in meters' },
        thickness: { type: 'number', description: 'Wall thickness in meters' },
      },
      required: ['pressure', 'radius', 'thickness'],
    },
    handler: async (args: { pressure: number; radius: number; thickness: number }) => {
      try {
        const result = structural.hoopStress(args.pressure, args.radius, args.thickness);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },

  // --- Beams ---
  {
    name: 'agent_tools_structural_simply_supported_beam',
    description: 'Analyze a simply supported beam: reactions, max moment, max shear, and deflection. Load types: point-center, point-custom, uniform, triangular.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        length: { type: 'number', description: 'Beam length in meters' },
        load: { type: 'number', description: 'Total load in Newtons' },
        loadType: { type: 'string', enum: ['point-center', 'point-custom', 'uniform', 'triangular'], description: 'Type of loading' },
        E: { type: 'number', description: 'Elastic modulus in Pa (optional, for deflection)' },
        I: { type: 'number', description: 'Moment of inertia in m⁴ (optional, for deflection)' },
        loadPosition: { type: 'number', description: 'Load position from left end in meters (for point-custom)' },
      },
      required: ['length', 'load', 'loadType'],
    },
    handler: async (args: { length: number; load: number; loadType: string; E?: number; I?: number; loadPosition?: number }) => {
      try {
        const result = structural.simplySupported(args.length, args.load, args.loadType as structural.BeamLoadType, args.E, args.I, args.loadPosition);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_cantilever_beam',
    description: 'Analyze a cantilever beam: reactions, max moment, max shear, and deflection. Load types: point-end, point-custom, uniform.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        length: { type: 'number', description: 'Beam length in meters' },
        load: { type: 'number', description: 'Total load in Newtons' },
        loadType: { type: 'string', enum: ['point-end', 'point-custom', 'uniform'], description: 'Type of loading' },
        E: { type: 'number', description: 'Elastic modulus in Pa (optional, for deflection)' },
        I: { type: 'number', description: 'Moment of inertia in m⁴ (optional, for deflection)' },
        loadPosition: { type: 'number', description: 'Load position from fixed end in meters (for point-custom)' },
      },
      required: ['length', 'load', 'loadType'],
    },
    handler: async (args: { length: number; load: number; loadType: string; E?: number; I?: number; loadPosition?: number }) => {
      try {
        const result = structural.cantilever(args.length, args.load, args.loadType as structural.CantileverLoadType, args.E, args.I, args.loadPosition);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },

  // --- Columns ---
  {
    name: 'agent_tools_structural_euler_buckling',
    description: "Calculate Euler's critical buckling load (Pcr = π²EI/Le²) for columns with various end conditions.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        E: { type: 'number', description: 'Elastic modulus in Pa' },
        I: { type: 'number', description: 'Moment of inertia in m⁴' },
        length: { type: 'number', description: 'Column length in meters' },
        endCondition: { type: 'string', enum: ['pinned-pinned', 'fixed-free', 'fixed-pinned', 'fixed-fixed'], description: 'End support conditions' },
      },
      required: ['E', 'I', 'length', 'endCondition'],
    },
    handler: async (args: { E: number; I: number; length: number; endCondition: string }) => {
      try {
        const result = structural.eulerBuckling(args.E, args.I, args.length, args.endCondition as structural.EndCondition);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_slenderness_ratio',
    description: 'Calculate slenderness ratio (λ = Le/r) and classify column as short, intermediate, or long.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        effectiveLength: { type: 'number', description: 'Effective length in meters' },
        radiusOfGyration: { type: 'number', description: 'Radius of gyration in meters' },
      },
      required: ['effectiveLength', 'radiusOfGyration'],
    },
    handler: async (args: { effectiveLength: number; radiusOfGyration: number }) => {
      try {
        const result = structural.slendernessRatio(args.effectiveLength, args.radiusOfGyration);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },

  // --- Sections ---
  {
    name: 'agent_tools_structural_rectangle_section',
    description: 'Calculate properties of a rectangular cross-section: area, Ixx, Iyy, Sx, Sy, rx, ry.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        width: { type: 'number', description: 'Width in meters' },
        height: { type: 'number', description: 'Height in meters' },
      },
      required: ['width', 'height'],
    },
    handler: async (args: { width: number; height: number }) => {
      try {
        const result = structural.rectangleSection(args.width, args.height);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_circular_section',
    description: 'Calculate properties of a solid circular cross-section: area, I, S, r.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        diameter: { type: 'number', description: 'Diameter in meters' },
      },
      required: ['diameter'],
    },
    handler: async (args: { diameter: number }) => {
      try {
        const result = structural.circularSection(args.diameter);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_hollow_circular_section',
    description: 'Calculate properties of a hollow circular (tube) cross-section: area, I, S, r.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        outerDiameter: { type: 'number', description: 'Outer diameter in meters' },
        innerDiameter: { type: 'number', description: 'Inner diameter in meters' },
      },
      required: ['outerDiameter', 'innerDiameter'],
    },
    handler: async (args: { outerDiameter: number; innerDiameter: number }) => {
      try {
        const result = structural.hollowCircularSection(args.outerDiameter, args.innerDiameter);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_i_beam_section',
    description: 'Calculate properties of an I-beam (wide flange) cross-section: area, Ixx, Iyy, Sx, Sy, rx, ry.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        flangeWidth: { type: 'number', description: 'Flange width in meters' },
        flangeThickness: { type: 'number', description: 'Flange thickness in meters' },
        webHeight: { type: 'number', description: 'Web height (between flanges) in meters' },
        webThickness: { type: 'number', description: 'Web thickness in meters' },
      },
      required: ['flangeWidth', 'flangeThickness', 'webHeight', 'webThickness'],
    },
    handler: async (args: { flangeWidth: number; flangeThickness: number; webHeight: number; webThickness: number }) => {
      try {
        const result = structural.iBeamSection(args.flangeWidth, args.flangeThickness, args.webHeight, args.webThickness);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },

  // --- Soils ---
  {
    name: 'agent_tools_structural_terzaghi_bearing',
    description: "Calculate Terzaghi's bearing capacity for shallow foundations (strip, square, circular).",
    inputSchema: {
      type: 'object' as const,
      properties: {
        cohesion: { type: 'number', description: 'Soil cohesion in Pa' },
        depth: { type: 'number', description: 'Foundation depth in meters' },
        unitWeight: { type: 'number', description: 'Soil unit weight in N/m³' },
        frictionAngle: { type: 'number', description: 'Soil friction angle in degrees' },
        foundationType: { type: 'string', enum: ['strip', 'square', 'circular'], description: 'Foundation shape' },
      },
      required: ['cohesion', 'depth', 'unitWeight', 'frictionAngle', 'foundationType'],
    },
    handler: async (args: { cohesion: number; depth: number; unitWeight: number; frictionAngle: number; foundationType: string }) => {
      try {
        const result = structural.terzaghiBearing(args.cohesion, args.depth, args.unitWeight, args.frictionAngle, args.foundationType as structural.FoundationType);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_lateral_earth_pressure',
    description: 'Calculate Rankine lateral earth pressure coefficients and forces (active, passive, at-rest).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        unitWeight: { type: 'number', description: 'Soil unit weight in N/m³' },
        height: { type: 'number', description: 'Wall/excavation height in meters' },
        frictionAngle: { type: 'number', description: 'Soil friction angle in degrees' },
        pressureType: { type: 'string', enum: ['active', 'passive', 'at-rest'], description: 'Type of earth pressure' },
      },
      required: ['unitWeight', 'height', 'frictionAngle', 'pressureType'],
    },
    handler: async (args: { unitWeight: number; height: number; frictionAngle: number; pressureType: string }) => {
      try {
        const result = structural.lateralEarthPressure(args.unitWeight, args.height, args.frictionAngle, args.pressureType as structural.EarthPressureType);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_settlement',
    description: 'Calculate elastic settlement (δ = qH/E) for foundations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        load: { type: 'number', description: 'Applied load in Newtons' },
        area: { type: 'number', description: 'Foundation area in m²' },
        elasticModulus: { type: 'number', description: 'Soil elastic modulus in Pa' },
        thickness: { type: 'number', description: 'Compressible layer thickness in meters' },
      },
      required: ['load', 'area', 'elasticModulus', 'thickness'],
    },
    handler: async (args: { load: number; area: number; elasticModulus: number; thickness: number }) => {
      try {
        const result = structural.settlement(args.load, args.area, args.elasticModulus, args.thickness);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },

  // --- Materials ---
  {
    name: 'agent_tools_structural_get_material',
    description: 'Look up structural material properties (E, fy, fu, density, Poisson ratio, thermal expansion) by name.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Material name (e.g., A36, A992, 304, 6061, C30, Douglas Fir)' },
      },
      required: ['name'],
    },
    handler: async (args: { name: string }) => {
      try {
        const result = structural.getMaterial(args.name);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_structural_list_materials',
    description: 'List structural materials, optionally filtered by category (steel, aluminum, concrete, timber, other).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        category: { type: 'string', description: 'Filter by category: steel, aluminum, concrete, timber, other' },
      },
      required: [] as string[],
    },
    handler: async (args: { category?: string }) => {
      try {
        const result = structural.listMaterials(args.category);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
];
