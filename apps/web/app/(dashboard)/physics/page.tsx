'use client';

import { useState, useCallback } from 'react';
import * as physics from '@atmaticai/agent-tools-core/physics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';

function formatValue(val: unknown): string {
  if (typeof val !== 'number') return String(val);
  if (Number.isNaN(val)) return 'NaN';
  if (Math.abs(val) > 1e6 || (Math.abs(val) < 0.001 && val !== 0)) return val.toExponential(4);
  return val.toFixed(4);
}

export default function PhysicsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Physics Calculator</h1>
          <p className="text-muted-foreground">
            Constants, kinematics, mechanics, electricity, waves, thermodynamics, and relativity
          </p>
          <ToolEnableToggle toolId="physics" />
        </div>
        <AIIntegrationBadge tool="physics" />
      </div>

      <Tabs defaultValue="constants" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="constants">Constants</TabsTrigger>
          <TabsTrigger value="kinematics">Kinematics</TabsTrigger>
          <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
          <TabsTrigger value="electricity">Electricity</TabsTrigger>
          <TabsTrigger value="waves">Waves</TabsTrigger>
          <TabsTrigger value="thermo">Thermo</TabsTrigger>
          <TabsTrigger value="relativity">Relativity</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
        </TabsList>

        <TabsContent value="constants"><ConstantsPanel /></TabsContent>
        <TabsContent value="kinematics"><KinematicsPanel /></TabsContent>
        <TabsContent value="mechanics"><MechanicsPanel /></TabsContent>
        <TabsContent value="electricity"><ElectricityPanel /></TabsContent>
        <TabsContent value="waves"><WavesPanel /></TabsContent>
        <TabsContent value="thermo"><ThermoPanel /></TabsContent>
        <TabsContent value="relativity"><RelativityPanel /></TabsContent>
        <TabsContent value="units"><UnitsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function ResultGrid({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Object.entries(result).map(([key, val]) => {
        if (Array.isArray(val)) return null;
        return (
          <div key={key} className="rounded-lg border bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground">{key}</div>
            <div className="font-mono text-sm font-semibold">{formatValue(val)}</div>
          </div>
        );
      })}
    </div>
  );
}

function ConstantsPanel() {
  const [category, setCategory] = useState('all');
  const [searchKey, setSearchKey] = useState('');
  const [result, setResult] = useState<physics.PhysicalConstant | null>(null);
  const [list, setList] = useState<physics.PhysicalConstant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = useCallback(() => {
    try {
      if (searchKey.trim()) {
        setResult(physics.getConstant(searchKey.trim()));
        setList(null);
      } else {
        setList(physics.listConstants(category === 'all' ? undefined : category));
        setResult(null);
      }
      setError(null);
      toast.success('Found');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Lookup failed');
    }
  }, [searchKey, category]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Physical Constants</CardTitle>
        <CardDescription>Look up fundamental physical constants</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input type="text" value={searchKey} onChange={(e) => setSearchKey(e.target.value)}
            placeholder="Constant key (e.g., c, G, h, k_B)"
            className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm font-mono" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="universal">Universal</SelectItem>
              <SelectItem value="electromagnetic">Electromagnetic</SelectItem>
              <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
              <SelectItem value="quantum">Quantum</SelectItem>
              <SelectItem value="atomic">Atomic</SelectItem>
              <SelectItem value="mechanics">Mechanics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleLookup}>Look Up</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{result.symbol}</span>
              <span className="text-lg text-muted-foreground">{result.name}</span>
            </div>
            <div className="font-mono text-sm">{result.value.toExponential(10)}</div>
            <div className="text-xs text-muted-foreground">{result.unit} | {result.category}</div>
          </div>
        )}
        {list && (
          <ScrollArea className="h-[400px] rounded-md border bg-muted/50">
            <div className="space-y-1 p-4">
              {list.map((c) => (
                <div key={c.symbol} className="flex items-center justify-between rounded p-2 hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <span className="w-8 font-mono font-bold text-sm">{c.symbol}</span>
                    <span className="text-sm">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs">{c.value.toExponential(6)}</span>
                    <span className="text-xs text-muted-foreground w-20">{c.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function KinematicsPanel() {
  const [mode, setMode] = useState<'equations' | 'projectile' | 'freefall'>('equations');
  const [s, setS] = useState('');
  const [u, setU] = useState('');
  const [v, setV] = useState('');
  const [a, setA] = useState('');
  const [t, setT] = useState('');
  const [projV, setProjV] = useState('');
  const [projAngle, setProjAngle] = useState('');
  const [ffHeight, setFfHeight] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    try {
      if (mode === 'equations') {
        const params: Record<string, number> = {};
        if (s) params.displacement = parseFloat(s);
        if (u) params.initialVelocity = parseFloat(u);
        if (v) params.finalVelocity = parseFloat(v);
        if (a) params.acceleration = parseFloat(a);
        if (t) params.time = parseFloat(t);
        setResult(physics.solveKinematics(params) as unknown as Record<string, unknown>);
      } else if (mode === 'projectile') {
        setResult(physics.projectileMotion(parseFloat(projV), parseFloat(projAngle)) as unknown as Record<string, unknown>);
      } else {
        setResult(physics.freeFall(parseFloat(ffHeight)) as unknown as Record<string, unknown>);
      }
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [mode, s, u, v, a, t, projV, projAngle, ffHeight]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Kinematics</CardTitle>
        <CardDescription>Motion equations, projectile motion, and free fall</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={mode} onValueChange={(val) => { setMode(val as typeof mode); setResult(null); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="equations">Equations of Motion</SelectItem>
            <SelectItem value="projectile">Projectile Motion</SelectItem>
            <SelectItem value="freefall">Free Fall</SelectItem>
          </SelectContent>
        </Select>

        {mode === 'equations' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Enter at least 3 known values. Leave unknown fields empty.</p>
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                { label: 's (m)', val: s, set: setS, ph: 'Displacement' },
                { label: 'u (m/s)', val: u, set: setU, ph: 'Initial vel.' },
                { label: 'v (m/s)', val: v, set: setV, ph: 'Final vel.' },
                { label: 'a (m/s\u00B2)', val: a, set: setA, ph: 'Acceleration' },
                { label: 't (s)', val: t, set: setT, ph: 'Time' },
              ].map(({ label, val, set, ph }) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-medium">{label}</label>
                  <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'projectile' && (
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Initial Velocity (m/s)</label>
              <input type="number" value={projV} onChange={(e) => setProjV(e.target.value)}
                className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Angle (degrees)</label>
              <input type="number" value={projAngle} onChange={(e) => setProjAngle(e.target.value)}
                className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
          </div>
        )}

        {mode === 'freefall' && (
          <div className="space-y-1">
            <label className="text-xs font-medium">Height (m)</label>
            <input type="number" value={ffHeight} onChange={(e) => setFfHeight(e.target.value)}
              className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
          </div>
        )}

        <Button onClick={handleCalculate}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function MechanicsPanel() {
  const [action, setAction] = useState('force');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fields: Record<string, { label: string; ph: string }[]> = {
    force: [{ label: 'Mass (kg)', ph: '10' }, { label: 'Acceleration (m/s\u00B2)', ph: '9.8' }],
    energy: [{ label: 'Mass (kg)', ph: '10' }, { label: 'Velocity (m/s)', ph: '5' }, { label: 'Height (m)', ph: '0' }],
    gravity: [{ label: 'Mass 1 (kg)', ph: '5.97e24' }, { label: 'Mass 2 (kg)', ph: '7.34e22' }, { label: 'Distance (m)', ph: '3.84e8' }],
    momentum: [{ label: 'Mass (kg)', ph: '10' }, { label: 'Velocity (m/s)', ph: '5' }],
    orbital: [{ label: 'Central Mass (kg)', ph: '5.97e24' }, { label: 'Radius (m)', ph: '6.371e6' }],
    work: [{ label: 'Force (N)', ph: '100' }, { label: 'Distance (m)', ph: '5' }, { label: 'Angle (\u00B0)', ph: '0' }],
  };

  const handleCalc = useCallback(() => {
    try {
      const vals = Object.values(inputs).map(Number);
      let r: unknown;
      switch (action) {
        case 'force': r = physics.calculateForce(vals[0], vals[1]); break;
        case 'energy': r = physics.calculateEnergy(vals[0], vals[1], vals[2] || 0); break;
        case 'gravity': r = physics.gravitationalForce(vals[0], vals[1], vals[2]); break;
        case 'momentum': r = physics.calculateMomentum(vals[0], vals[1]); break;
        case 'orbital': r = physics.orbitalMechanics(vals[0], vals[1]); break;
        case 'work': r = physics.calculateWork(vals[0], vals[1], vals[2] || 0); break;
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [action, inputs]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Mechanics</CardTitle>
        <CardDescription>Force, energy, gravity, momentum, orbital mechanics, and work</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="force">Force (F = ma)</SelectItem>
            <SelectItem value="energy">Energy (KE + PE)</SelectItem>
            <SelectItem value="gravity">Gravitational Force</SelectItem>
            <SelectItem value="momentum">Momentum (p = mv)</SelectItem>
            <SelectItem value="orbital">Orbital Mechanics</SelectItem>
            <SelectItem value="work">Work (W = Fd cos\u03B8)</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-end gap-4">
          {(fields[action] || []).map((f, i) => (
            <div key={f.label} className="space-y-1">
              <label className="text-xs font-medium">{f.label}</label>
              <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                placeholder={f.ph} className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <Button onClick={handleCalc}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function ElectricityPanel() {
  const [action, setAction] = useState('ohmsLaw');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalc = useCallback(() => {
    try {
      let r: unknown;
      switch (action) {
        case 'ohmsLaw': {
          const params: Record<string, number> = {};
          if (inputs['0']) params.voltage = parseFloat(inputs['0']);
          if (inputs['1']) params.current = parseFloat(inputs['1']);
          if (inputs['2']) params.resistance = parseFloat(inputs['2']);
          r = physics.ohmsLaw(params);
          break;
        }
        case 'resistors': {
          const values = (inputs['0'] || '').split(',').map(Number).filter((n) => !isNaN(n));
          r = physics.resistors(values, (inputs['1'] || 'series') as 'series' | 'parallel');
          break;
        }
        case 'coulomb':
          r = physics.coulombsLaw(parseFloat(inputs['0']), parseFloat(inputs['1']), parseFloat(inputs['2']));
          break;
        case 'capacitors': {
          const values = (inputs['0'] || '').split(',').map(Number).filter((n) => !isNaN(n));
          r = physics.capacitors(values, (inputs['1'] || 'series') as 'series' | 'parallel');
          break;
        }
        case 'rcCircuit':
          r = physics.rcCircuit(parseFloat(inputs['0']), parseFloat(inputs['1']));
          break;
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [action, inputs]);

  const renderFields = () => {
    switch (action) {
      case 'ohmsLaw':
        return (
          <>
            <p className="text-xs text-muted-foreground">Enter at least 2 known values</p>
            <div className="flex flex-wrap gap-4">
              {['Voltage (V)', 'Current (A)', 'Resistance (\u03A9)'].map((label, i) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-medium">{label}</label>
                  <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                    className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
          </>
        );
      case 'resistors':
      case 'capacitors':
        return (
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium">Values (comma-separated)</label>
              <input type="text" value={inputs['0'] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, '0': e.target.value }))}
                placeholder="100, 200, 300" className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Configuration</label>
              <Select value={inputs['1'] || 'series'} onValueChange={(v) => setInputs((prev) => ({ ...prev, '1': v }))}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="series">Series</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'coulomb':
        return (
          <div className="flex flex-wrap gap-4">
            {['Charge 1 (C)', 'Charge 2 (C)', 'Distance (m)'].map((label, i) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                  className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        );
      case 'rcCircuit':
        return (
          <div className="flex flex-wrap gap-4">
            {['Resistance (\u03A9)', 'Capacitance (F)'].map((label, i) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                  className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Electricity & Circuits</CardTitle>
        <CardDescription>Ohm&apos;s law, resistors, Coulomb&apos;s law, capacitors, and RC circuits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ohmsLaw">Ohm&apos;s Law</SelectItem>
            <SelectItem value="resistors">Resistors</SelectItem>
            <SelectItem value="coulomb">Coulomb&apos;s Law</SelectItem>
            <SelectItem value="capacitors">Capacitors</SelectItem>
            <SelectItem value="rcCircuit">RC Circuit</SelectItem>
          </SelectContent>
        </Select>
        {renderFields()}
        <Button onClick={handleCalc}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function WavesPanel() {
  const [action, setAction] = useState('wave');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalc = useCallback(() => {
    try {
      let r: unknown;
      switch (action) {
        case 'wave': {
          const params: Record<string, number> = {};
          if (inputs['0']) params.frequency = parseFloat(inputs['0']);
          if (inputs['1']) params.wavelength = parseFloat(inputs['1']);
          if (inputs['2']) params.speed = parseFloat(inputs['2']);
          r = physics.waveEquation(params);
          break;
        }
        case 'doppler':
          r = physics.dopplerEffect(parseFloat(inputs['0']), parseFloat(inputs['1']), parseFloat(inputs['2'] || '0'),
            parseFloat(inputs['3'] || '343'), inputs['4'] !== 'false');
          break;
        case 'snell':
          r = physics.snellsLaw(parseFloat(inputs['0']), parseFloat(inputs['1']), parseFloat(inputs['2']));
          break;
        case 'lens': {
          const params: Record<string, number> = {};
          if (inputs['0']) params.focalLength = parseFloat(inputs['0']);
          if (inputs['1']) params.objectDistance = parseFloat(inputs['1']);
          if (inputs['2']) params.imageDistance = parseFloat(inputs['2']);
          r = physics.thinLens(params);
          break;
        }
        case 'decibel':
          r = physics.decibelConversion(parseFloat(inputs['0']), parseFloat(inputs['1']));
          break;
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [action, inputs]);

  const fieldSets: Record<string, { labels: string[]; hint?: string }> = {
    wave: { labels: ['Frequency (Hz)', 'Wavelength (m)', 'Speed (m/s)'], hint: 'Enter at least 2 known values' },
    doppler: { labels: ['Source Freq (Hz)', 'Source Vel (m/s)', 'Observer Vel (m/s)', 'Medium Speed (m/s)'] },
    snell: { labels: ['n1 (refractive index)', 'n2 (refractive index)', 'Angle 1 (degrees)'] },
    lens: { labels: ['Focal Length (m)', 'Object Distance (m)', 'Image Distance (m)'], hint: 'Enter at least 2 known values' },
    decibel: { labels: ['Reference Intensity', 'Measured Intensity'] },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Waves & Optics</CardTitle>
        <CardDescription>Wave equation, Doppler effect, Snell&apos;s law, thin lens, and decibels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="wave">Wave Equation</SelectItem>
            <SelectItem value="doppler">Doppler Effect</SelectItem>
            <SelectItem value="snell">Snell&apos;s Law</SelectItem>
            <SelectItem value="lens">Thin Lens</SelectItem>
            <SelectItem value="decibel">Decibel</SelectItem>
          </SelectContent>
        </Select>
        {fieldSets[action]?.hint && <p className="text-xs text-muted-foreground">{fieldSets[action].hint}</p>}
        <div className="flex flex-wrap gap-4">
          {(fieldSets[action]?.labels || []).map((label, i) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-medium">{label}</label>
              <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
          ))}
          {action === 'doppler' && (
            <div className="space-y-1">
              <label className="text-xs font-medium">Direction</label>
              <Select value={inputs['4'] || 'true'} onValueChange={(v) => setInputs((prev) => ({ ...prev, '4': v }))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Approaching</SelectItem>
                  <SelectItem value="false">Receding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Button onClick={handleCalc}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function ThermoPanel() {
  const [action, setAction] = useState('idealGas');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalc = useCallback(() => {
    try {
      let r: unknown;
      switch (action) {
        case 'idealGas': {
          const params: Record<string, number> = {};
          if (inputs['0']) params.pressure = parseFloat(inputs['0']);
          if (inputs['1']) params.volume = parseFloat(inputs['1']);
          if (inputs['2']) params.moles = parseFloat(inputs['2']);
          if (inputs['3']) params.temperature = parseFloat(inputs['3']);
          r = physics.idealGasLaw(params);
          break;
        }
        case 'heatTransfer':
          r = physics.heatTransfer(parseFloat(inputs['0']), parseFloat(inputs['1']), parseFloat(inputs['2']));
          break;
        case 'thermalExpansion':
          r = physics.thermalExpansion(parseFloat(inputs['0']), parseFloat(inputs['1']), parseFloat(inputs['2']));
          break;
        case 'carnot':
          r = physics.carnotEfficiency(parseFloat(inputs['0']), parseFloat(inputs['1']));
          break;
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [action, inputs]);

  const fieldSets: Record<string, { labels: string[]; hint?: string }> = {
    idealGas: { labels: ['Pressure (Pa)', 'Volume (m\u00B3)', 'Moles (mol)', 'Temperature (K)'], hint: 'Enter at least 3 known values (SI units)' },
    heatTransfer: { labels: ['Mass (kg)', 'Specific Heat (J/kg\u00B7K)', 'Temp Change (K)'] },
    thermalExpansion: { labels: ['Original Length (m)', 'Coefficient (1/K)', 'Temp Change (K)'] },
    carnot: { labels: ['Hot Temperature (K)', 'Cold Temperature (K)'] },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Thermodynamics</CardTitle>
        <CardDescription>Ideal gas law, heat transfer, thermal expansion, and Carnot efficiency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="idealGas">Ideal Gas Law</SelectItem>
            <SelectItem value="heatTransfer">Heat Transfer</SelectItem>
            <SelectItem value="thermalExpansion">Thermal Expansion</SelectItem>
            <SelectItem value="carnot">Carnot Efficiency</SelectItem>
          </SelectContent>
        </Select>
        {fieldSets[action]?.hint && <p className="text-xs text-muted-foreground">{fieldSets[action].hint}</p>}
        <div className="flex flex-wrap gap-4">
          {(fieldSets[action]?.labels || []).map((label, i) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-medium">{label}</label>
              <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <Button onClick={handleCalc}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function RelativityPanel() {
  const [action, setAction] = useState('lorentz');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fields: Record<string, { label: string; ph: string }[]> = {
    lorentz: [{ label: 'Velocity (m/s)', ph: '150000000' }],
    timeDilation: [{ label: 'Proper Time (s)', ph: '1' }, { label: 'Velocity (m/s)', ph: '150000000' }],
    lengthContraction: [{ label: 'Proper Length (m)', ph: '1' }, { label: 'Velocity (m/s)', ph: '150000000' }],
    massEnergy: [{ label: 'Mass (kg)', ph: '1' }],
    energyToMass: [{ label: 'Energy (J)', ph: '9e16' }],
  };

  const handleCalc = useCallback(() => {
    try {
      const vals = Object.values(inputs).map(Number);
      let r: unknown;
      switch (action) {
        case 'lorentz': r = physics.lorentzFactor(vals[0]); break;
        case 'timeDilation': r = physics.timeDilation(vals[0], vals[1]); break;
        case 'lengthContraction': r = physics.lengthContraction(vals[0], vals[1]); break;
        case 'massEnergy': r = physics.massEnergy(vals[0]); break;
        case 'energyToMass': r = physics.energyToMass(vals[0]); break;
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [action, inputs]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Special Relativity</CardTitle>
        <CardDescription>Lorentz factor, time dilation, length contraction, and mass-energy equivalence</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="lorentz">Lorentz Factor</SelectItem>
            <SelectItem value="timeDilation">Time Dilation</SelectItem>
            <SelectItem value="lengthContraction">Length Contraction</SelectItem>
            <SelectItem value="massEnergy">E = mc\u00B2</SelectItem>
            <SelectItem value="energyToMass">Mass from Energy</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-end gap-4">
          {(fields[action] || []).map((f, i) => (
            <div key={f.label} className="space-y-1">
              <label className="text-xs font-medium">{f.label}</label>
              <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                placeholder={f.ph} className="w-44 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <Button onClick={handleCalc}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function UnitsPanel() {
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<physics.PhysicsUnitCategory>('force');
  const [from, setFrom] = useState('n');
  const [to, setTo] = useState('lbf');
  const [result, setResult] = useState<physics.PhysicsUnitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unitOptions: Record<string, string[]> = {
    force: ['n', 'kn', 'dyn', 'lbf', 'kgf'],
    energy: ['j', 'kj', 'cal', 'kcal', 'ev', 'kwh', 'btu', 'erg'],
    power: ['w', 'kw', 'mw', 'hp', 'btu/h'],
    pressure: ['pa', 'kpa', 'mpa', 'atm', 'bar', 'psi', 'torr', 'mmhg'],
    speed: ['m/s', 'km/h', 'mph', 'knots', 'ft/s'],
  };

  const handleConvert = useCallback(() => {
    try {
      setResult(physics.convertPhysicsUnit(parseFloat(value), from, to, category));
      setError(null);
      toast.success('Converted');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Conversion failed');
    }
  }, [value, from, to, category]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Physics Unit Conversion</CardTitle>
        <CardDescription>Convert between force, energy, power, pressure, and speed units</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Value:</span>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
              className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
          </div>
          <Select value={category} onValueChange={(v) => { const cat = v as physics.PhysicsUnitCategory; setCategory(cat); setFrom(unitOptions[v][0]); setTo(unitOptions[v][1]); }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="force">Force</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="power">Power</SelectItem>
              <SelectItem value="pressure">Pressure</SelectItem>
              <SelectItem value="speed">Speed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{unitOptions[category].map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}</SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">to</span>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{unitOptions[category].map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}</SelectContent>
          </Select>
          <Button onClick={handleConvert}>Convert</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <span className="text-2xl font-bold">{result.result.toFixed(6)}</span>
            <span className="ml-2 text-muted-foreground">{result.to}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
