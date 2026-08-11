const supabase = require('../config/db');

class Employee {
  async findAll() {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      throw new Error(error.message || error.details || "Failed to fetch employees from database");
    }
    return data || [];
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || error.details || `Failed to fetch employee with id ${id}`);
    }
    return data;
  }

  async create(employeeData) {
    const { data, error } = await supabase
      .from('employee')
      .insert(employeeData)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message || error.details || "Failed to create employee record");
    }
    return data;
  }

  async findByIdandUpdate(id, employeeData) {
    // Exclude id from update payload if present
    const { id: _ignoredId, ...updatePayload } = employeeData;

    const { data, error } = await supabase
      .from('employee')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message || error.details || `Failed to update employee with id ${id}`);
    }
    return data;
  }

  async findByIdandDelete(id) {
    const { data, error } = await supabase
      .from('employee')
      .delete()
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message || error.details || `Failed to delete employee with id ${id}`);
    }
    return data;
  }
}

module.exports = new Employee();