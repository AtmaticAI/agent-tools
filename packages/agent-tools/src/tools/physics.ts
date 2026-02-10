import * as physics from '../physics';

export const physicsTools = [
  {
    name: 'agent_tools_physics_constants',
    description: 'Look up physical constants (speed of light, Planck, Boltzmann, etc.) or list all constants by category.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        key: { type: 'string', description: 'Constant key (c, G, h, hbar, k_B, N_A, R, e, epsilon_0, mu_0, m_e, m_p, sigma, g, atm, k_e)' },
        category: { type: 'string', description: 'Filter by category: universal, electromagnetic, thermodynamics, quantum, atomic, mechanics, chemistry' },
      },
      required: [] as string[],
    },
    handler: async (args: { key?: string; category?: string }) => {
      try {
        if (args.key) {
          const result = physics.getConstant(args.key);
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        }
        const result = physics.listConstants(args.category);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_kinematics',
    description: 'Solve kinematics equations of motion. Provide at least 3 known values to solve for the remaining.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        displacement: { type: 'number', description: 'Displacement in meters' },
        initialVelocity: { type: 'number', description: 'Initial velocity in m/s' },
        finalVelocity: { type: 'number', description: 'Final velocity in m/s' },
        acceleration: { type: 'number', description: 'Acceleration in m/s²' },
        time: { type: 'number', description: 'Time in seconds' },
      },
      required: [] as string[],
    },
    handler: async (args: { displacement?: number; initialVelocity?: number; finalVelocity?: number; acceleration?: number; time?: number }) => {
      try {
        const result = physics.solveKinematics(args);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_projectile',
    description: 'Calculate projectile motion: range, max height, flight time, and velocity at peak.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        initialVelocity: { type: 'number', description: 'Initial velocity in m/s' },
        angle: { type: 'number', description: 'Launch angle in degrees (0-90)' },
        gravity: { type: 'number', description: 'Gravity in m/s² (default: 9.80665)' },
      },
      required: ['initialVelocity', 'angle'],
    },
    handler: async (args: { initialVelocity: number; angle: number; gravity?: number }) => {
      try {
        const result = physics.projectileMotion(args.initialVelocity, args.angle, args.gravity);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_force',
    description: 'Calculate force using Newton\'s second law (F = ma).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mass: { type: 'number', description: 'Mass in kg' },
        acceleration: { type: 'number', description: 'Acceleration in m/s²' },
      },
      required: ['mass', 'acceleration'],
    },
    handler: async (args: { mass: number; acceleration: number }) => {
      try {
        const result = physics.calculateForce(args.mass, args.acceleration);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_energy',
    description: 'Calculate kinetic energy, potential energy, and total mechanical energy.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mass: { type: 'number', description: 'Mass in kg' },
        velocity: { type: 'number', description: 'Velocity in m/s' },
        height: { type: 'number', description: 'Height in meters (default: 0)' },
        gravity: { type: 'number', description: 'Gravity in m/s² (default: 9.80665)' },
      },
      required: ['mass', 'velocity'],
    },
    handler: async (args: { mass: number; velocity: number; height?: number; gravity?: number }) => {
      try {
        const result = physics.calculateEnergy(args.mass, args.velocity, args.height, args.gravity);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_gravity',
    description: 'Calculate gravitational force between two masses using Newton\'s law of universal gravitation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mass1: { type: 'number', description: 'First mass in kg' },
        mass2: { type: 'number', description: 'Second mass in kg' },
        distance: { type: 'number', description: 'Distance between centers in meters' },
      },
      required: ['mass1', 'mass2', 'distance'],
    },
    handler: async (args: { mass1: number; mass2: number; distance: number }) => {
      try {
        const result = physics.gravitationalForce(args.mass1, args.mass2, args.distance);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_orbital',
    description: 'Calculate orbital velocity and escape velocity for a body orbiting a central mass.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mass: { type: 'number', description: 'Central body mass in kg' },
        radius: { type: 'number', description: 'Orbital radius in meters' },
      },
      required: ['mass', 'radius'],
    },
    handler: async (args: { mass: number; radius: number }) => {
      try {
        const result = physics.orbitalMechanics(args.mass, args.radius);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_ohms_law',
    description: 'Apply Ohm\'s law. Provide at least 2 of voltage, current, resistance to solve for the third and power.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        voltage: { type: 'number', description: 'Voltage in volts' },
        current: { type: 'number', description: 'Current in amperes' },
        resistance: { type: 'number', description: 'Resistance in ohms' },
      },
      required: [] as string[],
    },
    handler: async (args: { voltage?: number; current?: number; resistance?: number }) => {
      try {
        const result = physics.ohmsLaw(args);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_resistors',
    description: 'Calculate total resistance for resistors in series or parallel.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        values: { type: 'array', items: { type: 'number' }, description: 'Resistor values in ohms' },
        configuration: { type: 'string', enum: ['series', 'parallel'], description: 'Circuit configuration' },
      },
      required: ['values', 'configuration'],
    },
    handler: async (args: { values: number[]; configuration: 'series' | 'parallel' }) => {
      try {
        const result = physics.resistors(args.values, args.configuration);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_wave',
    description: 'Solve wave equation (v = fλ). Provide at least 2 of frequency, wavelength, speed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        frequency: { type: 'number', description: 'Frequency in Hz' },
        wavelength: { type: 'number', description: 'Wavelength in meters' },
        speed: { type: 'number', description: 'Wave speed in m/s' },
      },
      required: [] as string[],
    },
    handler: async (args: { frequency?: number; wavelength?: number; speed?: number }) => {
      try {
        const result = physics.waveEquation(args);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_snell',
    description: 'Apply Snell\'s law for light refraction. Calculates refraction angle and detects total internal reflection.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        n1: { type: 'number', description: 'Refractive index of medium 1' },
        n2: { type: 'number', description: 'Refractive index of medium 2' },
        angle: { type: 'number', description: 'Incident angle in degrees' },
      },
      required: ['n1', 'n2', 'angle'],
    },
    handler: async (args: { n1: number; n2: number; angle: number }) => {
      try {
        const result = physics.snellsLaw(args.n1, args.n2, args.angle);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_ideal_gas',
    description: 'Solve the ideal gas law (PV = nRT). Provide at least 3 of pressure, volume, moles, temperature.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pressure: { type: 'number', description: 'Pressure in Pa' },
        volume: { type: 'number', description: 'Volume in m³' },
        moles: { type: 'number', description: 'Amount in mol' },
        temperature: { type: 'number', description: 'Temperature in K' },
      },
      required: [] as string[],
    },
    handler: async (args: { pressure?: number; volume?: number; moles?: number; temperature?: number }) => {
      try {
        const result = physics.idealGasLaw(args);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_carnot',
    description: 'Calculate Carnot efficiency for a heat engine given hot and cold reservoir temperatures.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        hotTemperature: { type: 'number', description: 'Hot reservoir temperature in Kelvin' },
        coldTemperature: { type: 'number', description: 'Cold reservoir temperature in Kelvin' },
      },
      required: ['hotTemperature', 'coldTemperature'],
    },
    handler: async (args: { hotTemperature: number; coldTemperature: number }) => {
      try {
        const result = physics.carnotEfficiency(args.hotTemperature, args.coldTemperature);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_lorentz',
    description: 'Calculate the Lorentz factor (gamma) for special relativity given a velocity.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        velocity: { type: 'number', description: 'Velocity in m/s' },
      },
      required: ['velocity'],
    },
    handler: async (args: { velocity: number }) => {
      try {
        const result = physics.lorentzFactor(args.velocity);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_time_dilation',
    description: 'Calculate relativistic time dilation for a moving object.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        properTime: { type: 'number', description: 'Proper time in seconds' },
        velocity: { type: 'number', description: 'Velocity in m/s' },
      },
      required: ['properTime', 'velocity'],
    },
    handler: async (args: { properTime: number; velocity: number }) => {
      try {
        const result = physics.timeDilation(args.properTime, args.velocity);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_mass_energy',
    description: 'Calculate mass-energy equivalence (E = mc²). Convert mass to energy or energy to mass.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mass: { type: 'number', description: 'Mass in kg (for mass→energy)' },
        energy: { type: 'number', description: 'Energy in joules (for energy→mass)' },
      },
      required: [] as string[],
    },
    handler: async (args: { mass?: number; energy?: number }) => {
      try {
        const result = args.mass !== undefined ? physics.massEnergy(args.mass) : physics.energyToMass(args.energy!);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_physics_unit_convert',
    description: 'Convert between physics units: force (N, lbf, kgf), energy (J, cal, eV, kWh, BTU), power (W, hp), pressure (Pa, atm, bar, psi), speed (m/s, km/h, mph).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        value: { type: 'number', description: 'Value to convert' },
        from: { type: 'string', description: 'Source unit' },
        to: { type: 'string', description: 'Target unit' },
        category: { type: 'string', enum: ['force', 'energy', 'power', 'pressure', 'speed'], description: 'Unit category' },
      },
      required: ['value', 'from', 'to', 'category'],
    },
    handler: async (args: { value: number; from: string; to: string; category: string }) => {
      try {
        const result = physics.convertPhysicsUnit(args.value, args.from, args.to, args.category as physics.PhysicsUnitCategory);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
];
