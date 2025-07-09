# app.py - Python Flask Backend
from flask import Flask, render_template, request, jsonify
import math
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

@app.route('/')
def index():
    """Main calculator page"""
    logger.info("Calculator page accessed")
    return render_template('calculator.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    """Handle basic mathematical calculations"""
    try:
        data = request.get_json()
        expression = data.get('expression', '')
        
        logger.info(f"Calculation request: {expression}")
        
        # Basic security: only allow safe mathematical operations
        allowed_chars = set('0123456789+-*/.() ')
        if not all(c in allowed_chars for c in expression):
            logger.warning(f"Invalid characters in expression: {expression}")
            return jsonify({'error': 'Invalid characters in expression'})
        
        # Additional security checks
        if any(keyword in expression.lower() for keyword in ['import', 'exec', 'eval', '__']):
            logger.warning(f"Potentially dangerous expression: {expression}")
            return jsonify({'error': 'Invalid expression'})
        
        # Evaluate the expression safely
        result = eval(expression)
        
        # Handle special float values
        if math.isnan(result):
            return jsonify({'error': 'Result is not a number'})
        elif math.isinf(result):
            return jsonify({'error': 'Result is infinite'})
        
        logger.info(f"Calculation result: {result}")
        return jsonify({'result': result})
    
    except ZeroDivisionError:
        logger.error("Division by zero error")
        return jsonify({'error': 'Division by zero'})
    except SyntaxError:
        logger.error(f"Syntax error in expression: {expression}")
        return jsonify({'error': 'Invalid expression syntax'})
    except Exception as e:
        logger.error(f"Calculation error: {str(e)}")
        return jsonify({'error': 'Invalid expression'})

@app.route('/scientific', methods=['POST'])
def scientific_calculate():
    """Handle scientific mathematical operations"""
    try:
        data = request.get_json()
        operation = data.get('operation')
        value = float(data.get('value', 0))
        
        logger.info(f"Scientific operation: {operation}({value})")
        
        # Perform the scientific operation
        if operation == 'sin':
            result = math.sin(math.radians(value))
        elif operation == 'cos':
            result = math.cos(math.radians(value))
        elif operation == 'tan':
            result = math.tan(math.radians(value))
        elif operation == 'sqrt':
            if value < 0:
                return jsonify({'error': 'Cannot calculate square root of negative number'})
            result = math.sqrt(value)
        elif operation == 'log':
            if value <= 0:
                return jsonify({'error': 'Cannot calculate log of non-positive number'})
            result = math.log10(value)
        elif operation == 'ln':
            if value <= 0:
                return jsonify({'error': 'Cannot calculate ln of non-positive number'})
            result = math.log(value)
        elif operation == 'square':
            result = value ** 2
        elif operation == 'factorial':
            if value < 0 or value != int(value):
                return jsonify({'error': 'Factorial only defined for non-negative integers'})
            result = math.factorial(int(value))
        elif operation == 'abs':
            result = abs(value)
        elif operation == 'ceil':
            result = math.ceil(value)
        elif operation == 'floor':
            result = math.floor(value)
        else:
            logger.warning(f"Unknown operation: {operation}")
            return jsonify({'error': 'Unknown operation'})
        
        # Handle special float values
        if math.isnan(result):
            return jsonify({'error': 'Result is not a number'})
        elif math.isinf(result):
            return jsonify({'error': 'Result is infinite'})
        
        logger.info(f"Scientific operation result: {result}")
        return jsonify({'result': result})
    
    except ValueError as e:
        logger.error(f"Value error in scientific operation: {str(e)}")
        return jsonify({'error': 'Invalid input for operation'})
    except OverflowError:
        logger.error("Overflow error in scientific operation")
        return jsonify({'error': 'Result too large to calculate'})
    except Exception as e:
        logger.error(f"Scientific operation error: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/history', methods=['GET'])
def get_history():
    """Get calculation history (placeholder for database integration)"""
    # This could be expanded to store history in a database
    return jsonify({'history': []})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'calculator'})

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors"""
    return jsonify({'error': 'Bad request'}), 400

if __name__ == '__main__':
    logger.info("Starting Flask Calculator Application...")
    app.run(debug=True, host='127.0.0.1', port=5000) 
