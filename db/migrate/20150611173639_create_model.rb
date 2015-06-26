class CreateModel < ActiveRecord::Migration
  def up
    create_table :time_sheets do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :project_name
      t.string :task_name
      t.string :time_type
      t.column :submission_time, :BIGINT
      t.column :hours, :real
    end
  end
 
  def down
    drop_table :time_sheets
  end
end