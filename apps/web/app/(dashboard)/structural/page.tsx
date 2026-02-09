'use client';

import { useState, useCallback } from 'react';
import * as structural from '@agent-tools/core/structural';
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

export default function StructuralPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Structural Engineering</h1>
          <p className="text-muted-foreground">
            Stress analysis, beam design, column buckling, cross-sections, soil mechanics, and materials
          </p>
          <ToolEnableToggle toolId="structural" />
        </div>
        <AIIntegrationBadge tool="structural" />
      </div>

      <Tabs defaultValue="stress" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="stress">Stress &amp; Strain</TabsTrigger>
          <TabsTrigger value="beams">Beams</TabsTrigger>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="soils">Soils</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="stress"><StressPanel /></TabsContent>
        <TabsContent value="beams"><BeamsPanel /></TabsContent>
        <TabsContent value="columns"><ColumnsPanel /></TabsContent>
        <TabsContent value="sections"><SectionsPanel /></TabsContent>
        <TabsContent value="soils"><SoilsPanel /></TabsContent>
        <TabsContent value="materials"><MaterialsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function ResultGrid({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Object.entries(result).map(([key, val]) => {
        if (Array.isArray(val) || val === null) return null;
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

function StressPanel() {
  const [action, setAction] = useState('normalStress');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fields: Record<string, { label: string; ph: string }[]> = {
    normalStress: [{ label: 'Force (N)', ph: '10000' }, { label: 'Area (m\u00B2)', ph: '0.01' }],
    shearStress: [{ label: 'Shear Force (N)', ph: '5000' }, { label: 'Area (m\u00B2)', ph: '0.02' }],
    strain: [{ label: '\u0394L (m)', ph: '0.002' }, { label: 'Original L (m)', ph: '2.0' }],
    youngsModulus: [{ label: 'Stress (Pa)', ph: '200e6' }, { label: 'Strain', ph: '0.001' }],
    factorOfSafety: [{ label: 'Ultimate Stress (Pa)', ph: '400e6' }, { label: 'Working Stress (Pa)', ph: '200e6' }],
    hoopStress: [{ label: 'Pressure (Pa)', ph: '1e6' }, { label: 'Radius (m)', ph: '0.5' }, { label: 'Thickness (m)', ph: '0.01' }],
  };

  const handleCalc = useCallback(() => {
    try {
      const vals = Object.values(inputs).map(Number);
      let r: unknown;
      switch (action) {
        case 'normalStress': r = structural.normalStress(vals[0], vals[1]); break;
        case 'shearStress': r = structural.shearStress(vals[0], vals[1]); break;
        case 'strain': r = structural.strain(vals[0], vals[1]); break;
        case 'youngsModulus': r = structural.youngsModulus(vals[0], vals[1]); break;
        case 'factorOfSafety': r = structural.factorOfSafety(vals[0], vals[1]); break;
        case 'hoopStress': r = structural.hoopStress(vals[0], vals[1], vals[2]); break;
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
        <CardTitle className="text-base">Stress &amp; Strain</CardTitle>
        <CardDescription>Normal stress, shear stress, strain, Young&apos;s modulus, factor of safety, and hoop stress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="normalStress">Normal Stress (\u03C3 = F/A)</SelectItem>
            <SelectItem value="shearStress">Shear Stress (\u03C4 = V/A)</SelectItem>
            <SelectItem value="strain">Strain (\u03B5 = \u0394L/L)</SelectItem>
            <SelectItem value="youngsModulus">Young&apos;s Modulus (E = \u03C3/\u03B5)</SelectItem>
            <SelectItem value="factorOfSafety">Factor of Safety</SelectItem>
            <SelectItem value="hoopStress">Hoop Stress (pR/t)</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-end gap-4">
          {(fields[action] || []).map((f, i) => (
            <div key={f.label} className="space-y-1">
              <label className="text-xs font-medium">{f.label}</label>
              <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                placeholder={f.ph} className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm" />
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

function BeamsPanel() {
  const [beamType, setBeamType] = useState<'simplySupported' | 'cantilever'>('simplySupported');
  const [loadType, setLoadType] = useState('point-center');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ssLoadTypes = ['point-center', 'point-custom', 'uniform', 'triangular'];
  const cantLoadTypes = ['point-end', 'point-custom', 'uniform'];

  const handleCalc = useCallback(() => {
    try {
      const length = parseFloat(inputs.length || '0');
      const load = parseFloat(inputs.load || '0');
      const E = inputs.E ? parseFloat(inputs.E) : undefined;
      const I = inputs.I ? parseFloat(inputs.I) : undefined;
      const pos = inputs.position ? parseFloat(inputs.position) : undefined;

      let r: unknown;
      if (beamType === 'simplySupported') {
        r = structural.simplySupported(length, load, loadType as structural.BeamLoadType, E, I, pos);
      } else {
        r = structural.cantilever(length, load, loadType as structural.CantileverLoadType, E, I, pos);
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [beamType, loadType, inputs]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Beam Analysis</CardTitle>
        <CardDescription>Simply supported and cantilever beams with various loading conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Select value={beamType} onValueChange={(v) => {
            setBeamType(v as 'simplySupported' | 'cantilever');
            setLoadType(v === 'simplySupported' ? 'point-center' : 'point-end');
            setResult(null);
          }}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="simplySupported">Simply Supported</SelectItem>
              <SelectItem value="cantilever">Cantilever</SelectItem>
            </SelectContent>
          </Select>
          <Select value={loadType} onValueChange={setLoadType}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(beamType === 'simplySupported' ? ssLoadTypes : cantLoadTypes).map((lt) => (
                <SelectItem key={lt} value={lt}>{lt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Length (m)</label>
            <input type="number" value={inputs.length || ''} onChange={(e) => setInputs((prev) => ({ ...prev, length: e.target.value }))}
              placeholder="10" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Total Load (N)</label>
            <input type="number" value={inputs.load || ''} onChange={(e) => setInputs((prev) => ({ ...prev, load: e.target.value }))}
              placeholder="10000" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
          </div>
          {loadType === 'point-custom' && (
            <div className="space-y-1">
              <label className="text-xs font-medium">Load Position (m)</label>
              <input type="number" value={inputs.position || ''} onChange={(e) => setInputs((prev) => ({ ...prev, position: e.target.value }))}
                placeholder="3" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium">E (Pa, optional)</label>
            <input type="number" value={inputs.E || ''} onChange={(e) => setInputs((prev) => ({ ...prev, E: e.target.value }))}
              placeholder="200e9" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">I (m\u2074, optional)</label>
            <input type="number" value={inputs.I || ''} onChange={(e) => setInputs((prev) => ({ ...prev, I: e.target.value }))}
              placeholder="1e-4" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
          </div>
        </div>
        <Button onClick={handleCalc}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function ColumnsPanel() {
  const [action, setAction] = useState('eulerBuckling');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [endCondition, setEndCondition] = useState('pinned-pinned');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalc = useCallback(() => {
    try {
      let r: unknown;
      if (action === 'eulerBuckling') {
        r = structural.eulerBuckling(
          parseFloat(inputs.E || '0'),
          parseFloat(inputs.I || '0'),
          parseFloat(inputs.length || '0'),
          endCondition as structural.EndCondition
        );
      } else {
        r = structural.slendernessRatio(
          parseFloat(inputs.effectiveLength || '0'),
          parseFloat(inputs.radiusOfGyration || '0')
        );
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [action, inputs, endCondition]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Column Buckling</CardTitle>
        <CardDescription>Euler buckling and slenderness ratio classification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="eulerBuckling">Euler Buckling</SelectItem>
            <SelectItem value="slendernessRatio">Slenderness Ratio</SelectItem>
          </SelectContent>
        </Select>

        {action === 'eulerBuckling' && (
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">E (Pa)</label>
              <input type="number" value={inputs.E || ''} onChange={(e) => setInputs((prev) => ({ ...prev, E: e.target.value }))}
                placeholder="200e9" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">I (m\u2074)</label>
              <input type="number" value={inputs.I || ''} onChange={(e) => setInputs((prev) => ({ ...prev, I: e.target.value }))}
                placeholder="1e-4" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Length (m)</label>
              <input type="number" value={inputs.length || ''} onChange={(e) => setInputs((prev) => ({ ...prev, length: e.target.value }))}
                placeholder="5" className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">End Condition</label>
              <Select value={endCondition} onValueChange={setEndCondition}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pinned-pinned">Pinned-Pinned</SelectItem>
                  <SelectItem value="fixed-free">Fixed-Free</SelectItem>
                  <SelectItem value="fixed-pinned">Fixed-Pinned</SelectItem>
                  <SelectItem value="fixed-fixed">Fixed-Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {action === 'slendernessRatio' && (
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Effective Length (m)</label>
              <input type="number" value={inputs.effectiveLength || ''} onChange={(e) => setInputs((prev) => ({ ...prev, effectiveLength: e.target.value }))}
                placeholder="5" className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Radius of Gyration (m)</label>
              <input type="number" value={inputs.radiusOfGyration || ''} onChange={(e) => setInputs((prev) => ({ ...prev, radiusOfGyration: e.target.value }))}
                placeholder="0.05" className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm" />
            </div>
          </div>
        )}

        <Button onClick={handleCalc}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <ResultGrid result={result} />}
      </CardContent>
    </Card>
  );
}

function SectionsPanel() {
  const [shape, setShape] = useState('rectangle');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fields: Record<string, { label: string; ph: string }[]> = {
    rectangle: [{ label: 'Width (m)', ph: '0.2' }, { label: 'Height (m)', ph: '0.4' }],
    circular: [{ label: 'Diameter (m)', ph: '0.2' }],
    hollowCircular: [{ label: 'Outer Diameter (m)', ph: '0.2' }, { label: 'Inner Diameter (m)', ph: '0.16' }],
    iBeam: [
      { label: 'Flange Width (m)', ph: '0.2' },
      { label: 'Flange Thickness (m)', ph: '0.015' },
      { label: 'Web Height (m)', ph: '0.3' },
      { label: 'Web Thickness (m)', ph: '0.01' },
    ],
  };

  const handleCalc = useCallback(() => {
    try {
      const vals = Object.values(inputs).map(Number);
      let r: unknown;
      switch (shape) {
        case 'rectangle': r = structural.rectangleSection(vals[0], vals[1]); break;
        case 'circular': r = structural.circularSection(vals[0]); break;
        case 'hollowCircular': r = structural.hollowCircularSection(vals[0], vals[1]); break;
        case 'iBeam': r = structural.iBeamSection(vals[0], vals[1], vals[2], vals[3]); break;
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [shape, inputs]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cross-Section Properties</CardTitle>
        <CardDescription>Area, moment of inertia, section modulus, and radius of gyration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={shape} onValueChange={(v) => { setShape(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">Rectangle</SelectItem>
            <SelectItem value="circular">Solid Circle</SelectItem>
            <SelectItem value="hollowCircular">Hollow Circle (Tube)</SelectItem>
            <SelectItem value="iBeam">I-Beam</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-end gap-4">
          {(fields[shape] || []).map((f, i) => (
            <div key={f.label} className="space-y-1">
              <label className="text-xs font-medium">{f.label}</label>
              <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                placeholder={f.ph} className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm" />
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

function SoilsPanel() {
  const [action, setAction] = useState('terzaghiBearing');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [foundationType, setFoundationType] = useState('strip');
  const [pressureType, setPressureType] = useState('active');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalc = useCallback(() => {
    try {
      let r: unknown;
      switch (action) {
        case 'terzaghiBearing':
          r = structural.terzaghiBearing(
            parseFloat(inputs['0'] || '0'),
            parseFloat(inputs['1'] || '0'),
            parseFloat(inputs['2'] || '0'),
            parseFloat(inputs['3'] || '0'),
            foundationType as structural.FoundationType
          );
          break;
        case 'lateralEarthPressure':
          r = structural.lateralEarthPressure(
            parseFloat(inputs['0'] || '0'),
            parseFloat(inputs['1'] || '0'),
            parseFloat(inputs['2'] || '0'),
            pressureType as structural.EarthPressureType
          );
          break;
        case 'settlement':
          r = structural.settlement(
            parseFloat(inputs['0'] || '0'),
            parseFloat(inputs['1'] || '0'),
            parseFloat(inputs['2'] || '0'),
            parseFloat(inputs['3'] || '0')
          );
          break;
      }
      setResult(r as Record<string, unknown>);
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [action, inputs, foundationType, pressureType]);

  const renderFields = () => {
    switch (action) {
      case 'terzaghiBearing':
        return (
          <div className="flex flex-wrap items-end gap-4">
            {['Cohesion (Pa)', 'Depth (m)', 'Unit Weight (N/m\u00B3)', 'Friction Angle (\u00B0)'].map((label, i) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                  className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs font-medium">Foundation Type</label>
              <Select value={foundationType} onValueChange={setFoundationType}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="strip">Strip</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="circular">Circular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'lateralEarthPressure':
        return (
          <div className="flex flex-wrap items-end gap-4">
            {['Unit Weight (N/m\u00B3)', 'Height (m)', 'Friction Angle (\u00B0)'].map((label, i) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <input type="number" value={inputs[String(i)] || ''} onChange={(e) => setInputs((prev) => ({ ...prev, [String(i)]: e.target.value }))}
                  className="w-36 rounded-md border bg-transparent px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs font-medium">Pressure Type</label>
              <Select value={pressureType} onValueChange={setPressureType}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="passive">Passive</SelectItem>
                  <SelectItem value="at-rest">At-Rest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'settlement':
        return (
          <div className="flex flex-wrap items-end gap-4">
            {['Load (N)', 'Area (m\u00B2)', 'Elastic Modulus (Pa)', 'Thickness (m)'].map((label, i) => (
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
        <CardTitle className="text-base">Soil Mechanics</CardTitle>
        <CardDescription>Terzaghi bearing capacity, Rankine earth pressure, and elastic settlement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={action} onValueChange={(v) => { setAction(v); setInputs({}); setResult(null); }}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="terzaghiBearing">Terzaghi Bearing Capacity</SelectItem>
            <SelectItem value="lateralEarthPressure">Lateral Earth Pressure</SelectItem>
            <SelectItem value="settlement">Elastic Settlement</SelectItem>
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

function MaterialsPanel() {
  const [searchName, setSearchName] = useState('');
  const [category, setCategory] = useState('all');
  const [material, setMaterial] = useState<structural.MaterialProperties | null>(null);
  const [list, setList] = useState<structural.MaterialProperties[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = useCallback(() => {
    try {
      if (searchName.trim()) {
        setMaterial(structural.getMaterial(searchName.trim()));
        setList(null);
      } else {
        setList(structural.listMaterials(category === 'all' ? undefined : category));
        setMaterial(null);
      }
      setError(null);
      toast.success('Found');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Lookup failed');
    }
  }, [searchName, category]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Material Database</CardTitle>
        <CardDescription>Look up structural material properties (E, fy, fu, density, Poisson&apos;s ratio)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)}
            placeholder="Material name (e.g., A36, 6061, C30)"
            className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm font-mono" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="steel">Steel</SelectItem>
              <SelectItem value="aluminum">Aluminum</SelectItem>
              <SelectItem value="concrete">Concrete</SelectItem>
              <SelectItem value="timber">Timber</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleLookup}>Look Up</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {material && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{material.name}</span>
              <span className="text-xs rounded-full bg-primary/10 px-2 py-0.5 text-primary">{material.category}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded border p-2"><div className="text-xs text-muted-foreground">Elastic Modulus (E)</div><div className="font-mono text-sm font-semibold">{material.E.toExponential(2)} {material.Eunit}</div></div>
              <div className="rounded border p-2"><div className="text-xs text-muted-foreground">Yield Strength (fy)</div><div className="font-mono text-sm font-semibold">{material.fy.toExponential(2)} {material.fyUnit}</div></div>
              <div className="rounded border p-2"><div className="text-xs text-muted-foreground">Ultimate Strength (fu)</div><div className="font-mono text-sm font-semibold">{material.fu.toExponential(2)} {material.fuUnit}</div></div>
              <div className="rounded border p-2"><div className="text-xs text-muted-foreground">Density</div><div className="font-mono text-sm font-semibold">{material.density} {material.densityUnit}</div></div>
              <div className="rounded border p-2"><div className="text-xs text-muted-foreground">Poisson&apos;s Ratio</div><div className="font-mono text-sm font-semibold">{material.poissonsRatio}</div></div>
              <div className="rounded border p-2"><div className="text-xs text-muted-foreground">Thermal Expansion</div><div className="font-mono text-sm font-semibold">{material.thermalExpansion.toExponential(2)} {material.thermalExpansionUnit}</div></div>
            </div>
          </div>
        )}
        {list && (
          <ScrollArea className="h-[400px] rounded-md border bg-muted/50">
            <div className="space-y-1 p-4">
              {list.map((m) => (
                <div key={m.name} className="flex items-center justify-between rounded p-2 hover:bg-muted cursor-pointer"
                  onClick={() => { setSearchName(m.name); setMaterial(m); setList(null); }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs">E = {m.E.toExponential(2)}</span>
                    <span className="font-mono text-xs">fy = {m.fy.toExponential(2)}</span>
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
