import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAgentCard,
  createTask,
  getTask,
  cancelTask,
  listTasks,
  clearCompletedTasks,
} from '../agent';
import { skills } from '../skills';

describe('A2A Agent Card', () => {
  it('should return valid agent card', async () => {
    const card = await getAgentCard('https://example.com');

    expect(card.name).toBe('Agent Tools Data Agent');
    expect(card.version).toBe('1.0.0');
    expect(card.provider?.organization).toBe('atmatic.ai');
  });

  it('should include all skills', async () => {
    const card = await getAgentCard('https://example.com');

    expect(card.skills.length).toBe(18);
    const skillIds = card.skills.map((s) => s.id);
    expect(skillIds).toContain('json-operations');
    expect(skillIds).toContain('csv-operations');
    expect(skillIds).toContain('pdf-operations');
    expect(skillIds).toContain('xml-operations');
    expect(skillIds).toContain('crypto-operations');
    expect(skillIds).toContain('text-operations');
    expect(skillIds).toContain('math-operations');
    expect(skillIds).toContain('color-operations');
  });

  it('should have correct capabilities', async () => {
    const card = await getAgentCard('https://example.com');

    expect(card.capabilities.streaming).toBe(true);
    expect(card.capabilities.pushNotifications).toBe(false);
  });

  it('should include url from parameter', async () => {
    const baseUrl = 'https://agent-tools.example.com';
    const card = await getAgentCard(baseUrl);

    expect(card.url).toBe(baseUrl);
  });
});

describe('A2A Skills', () => {
  it('should have required skill properties', () => {
    for (const skill of skills) {
      expect(skill.id).toBeDefined();
      expect(skill.name).toBeDefined();
      expect(skill.description).toBeDefined();
    }
  });

  it('should have json-operations skill', () => {
    const jsonSkill = skills.find((s) => s.id === 'json-operations');
    expect(jsonSkill).toBeDefined();
    expect(jsonSkill?.name).toBe('JSON Processing');
  });

  it('should have csv-operations skill', () => {
    const csvSkill = skills.find((s) => s.id === 'csv-operations');
    expect(csvSkill).toBeDefined();
    expect(csvSkill?.name).toBe('CSV Processing');
  });

  it('should have pdf-operations skill', () => {
    const pdfSkill = skills.find((s) => s.id === 'pdf-operations');
    expect(pdfSkill).toBeDefined();
    expect(pdfSkill?.name).toBe('PDF Processing');
  });
});

describe('A2A Task Management', () => {
  beforeEach(() => {
    clearCompletedTasks();
  });

  describe('createTask', () => {
    it('should create a task with submitted status', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      expect(task.id).toBeDefined();
      expect(task.status.state).toBe('submitted');
      expect(task.status.timestamp).toBeDefined();
    });

    it('should include session ID when provided', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
        sessionId: 'test-session',
      });

      expect(task.sessionId).toBe('test-session');
    });

    it('should throw for unknown skill', async () => {
      await expect(
        createTask({
          skill: 'unknown-skill',
          input: { action: 'test' },
        })
      ).rejects.toThrow('Unknown skill');
    });

    it('should record input in history', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      expect(task.history).toBeDefined();
      expect(task.history?.length).toBe(1);
      expect(task.history?.[0].role).toBe('user');
    });
  });

  describe('getTask', () => {
    it('should retrieve task by ID', async () => {
      const created = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      const retrieved = getTask({ id: created.id });
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return null for unknown ID', () => {
      const task = getTask({ id: 'nonexistent' });
      expect(task).toBeNull();
    });

    it('should limit history when requested', async () => {
      const created = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      const retrieved = getTask({ id: created.id, historyLength: 0 });
      expect(retrieved?.history?.length).toBe(0);
    });
  });

  describe('cancelTask', () => {
    it('should cancel a pending task', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      const canceled = cancelTask({ id: task.id });
      expect(canceled?.status.state).toBe('canceled');
    });

    it('should return null for unknown ID', () => {
      const result = cancelTask({ id: 'nonexistent' });
      expect(result).toBeNull();
    });
  });

  describe('listTasks', () => {
    it('should list all tasks', async () => {
      await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });
      await createTask({
        skill: 'csv-operations',
        input: { action: 'parse', data: 'a,b\n1,2' },
      });

      const tasks = listTasks();
      expect(tasks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('clearCompletedTasks', () => {
    it('should clear completed and canceled tasks', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      cancelTask({ id: task.id });
      const cleared = clearCompletedTasks();

      expect(cleared).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('A2A Task Execution', () => {
  describe('JSON Operations', () => {
    it('should execute format action', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: {
          action: 'format',
          data: '{"b":2,"a":1}',
          options: { sortKeys: true },
        },
      });

      // Wait for task to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const completed = getTask({ id: task.id });
      expect(completed?.status.state).toBe('completed');
    });

    it('should execute validate action', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: {
          action: 'validate',
          data: '{"name":"test"}',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const completed = getTask({ id: task.id });
      expect(completed?.status.state).toBe('completed');
    });
  });

  describe('CSV Operations', () => {
    it('should execute parse action', async () => {
      const task = await createTask({
        skill: 'csv-operations',
        input: {
          action: 'parse',
          data: 'name,age\nJohn,30',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const completed = getTask({ id: task.id });
      expect(completed?.status.state).toBe('completed');
    });

    it('should execute toJson action', async () => {
      const task = await createTask({
        skill: 'csv-operations',
        input: {
          action: 'toJson',
          data: 'name,age\nJohn,30',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const completed = getTask({ id: task.id });
      expect(completed?.status.state).toBe('completed');
    });
  });
});

describe('A2A Protocol Compliance', () => {
  describe('Task States', () => {
    it('should transition through valid states', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      expect(task.status.state).toBe('submitted');

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 150));

      const completed = getTask({ id: task.id });
      expect(['working', 'completed']).toContain(completed?.status.state);
    });
  });

  describe('Agent Card Schema', () => {
    it('should match A2A agent card schema', async () => {
      const card = await getAgentCard('https://example.com');

      // Required fields
      expect(card.name).toBeDefined();
      expect(card.description).toBeDefined();
      expect(card.url).toBeDefined();
      expect(card.version).toBeDefined();
      expect(card.capabilities).toBeDefined();
      expect(card.skills).toBeDefined();

      // Skills structure
      for (const skill of card.skills) {
        expect(skill.id).toBeDefined();
        expect(skill.name).toBeDefined();
        expect(skill.description).toBeDefined();
      }
    });
  });

  describe('Task Response Schema', () => {
    it('should include required task fields', async () => {
      const task = await createTask({
        skill: 'json-operations',
        input: { action: 'format', data: '{"a":1}' },
      });

      expect(task.id).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.status.state).toBeDefined();
      expect(task.status.timestamp).toBeDefined();
    });
  });
});
